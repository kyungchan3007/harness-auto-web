import { describe, expect, it } from "vitest";
import { type ApiBinding, handleBff } from "./proxy";

/** 받은 요청을 기록하는 가짜 API */
const fakeApi = (respond: (r: Request) => Response | Promise<Response> = () => Response.json({ ok: true })) => {
  const seen: Request[] = [];
  const api: ApiBinding = { fetch: async (r) => (seen.push(r), respond(r)) };
  return { api, seen };
};
const get = (path: string, init?: RequestInit) => new Request(`https://tripfx.pages.dev${path}`, init);

describe("BFF 허용 경로", () => {
  it("읽기 경로는 API 로 넘기고 쿼리도 그대로", async () => {
    const { api, seen } = fakeApi();
    const res = await handleBff(get("/bff/activity?after=3&limit=10"), api);
    expect(res.status).toBe(200);
    expect(new URL(seen[0].url).pathname + new URL(seen[0].url).search).toBe("/activity?after=3&limit=10");
    for (const p of ["/bff/fx/latest", "/bff/fx/usd/history", "/bff/signal", "/bff/signal/JPY", "/bff/prices/levels", "/bff/tasks"]) {
      expect((await handleBff(get(p), api)).status, p).toBe(200);
    }
  });

  it("관리 · 모르는 경로는 API 에 닿지도 않고 404", async () => {
    const { api, seen } = fakeApi();
    for (const p of ["/bff/fx/collect", "/bff/prices/collect", "/bff/health", "/bff/activity/1", "/bff/../fx/collect"]) {
      expect((await handleBff(get(p), api)).status, p).toBe(404);
    }
    expect(seen).toHaveLength(0);
  });

  it("쓰기(POST)는 405 — 작업 기록은 훅만 씀", async () => {
    const { api, seen } = fakeApi();
    expect((await handleBff(get("/bff/activity", { method: "POST", body: "{}" }), api)).status).toBe(405);
    expect(seen).toHaveLength(0);
  });

  it("쿠키 · 인증 머리글은 API 로 넘기지 않음", async () => {
    const { api, seen } = fakeApi();
    await handleBff(get("/bff/activity", { headers: { cookie: "a=b", authorization: "Bearer x" } }), api);
    expect(seen[0].headers.get("cookie")).toBeNull();
    expect(seen[0].headers.get("authorization")).toBeNull();
  });
});

describe("BFF 캐시 · 실패", () => {
  it("작업 기록 3초 · 환율 5분", async () => {
    const { api } = fakeApi();
    expect((await handleBff(get("/bff/activity"), api)).headers.get("cache-control")).toBe("public, max-age=3");
    expect((await handleBff(get("/bff/fx/latest"), api)).headers.get("cache-control")).toBe("public, max-age=300");
  });

  it("API 실패 응답은 상태 그대로 · 캐시 안 함", async () => {
    const { api } = fakeApi(() => Response.json({ error: "x" }, { status: 503 }));
    const res = await handleBff(get("/bff/fx/latest"), api);
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("API 에 닿지 못하면 502", async () => {
    const { api } = fakeApi(() => Promise.reject(new Error("down")));
    expect((await handleBff(get("/bff/fx/latest"), api)).status).toBe(502);
  });
});
