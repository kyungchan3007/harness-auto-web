import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import type { Env } from "../env";
import { cacheKey, cached, clearApiCache } from "./cache";

/** api_cache 만 흉내 내는 가짜 D1 — select · insert or replace · delete */
function fakeD1() {
  const rows = new Map<string, string>();
  const d1 = {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind: (...a: unknown[]) => ((args = a), stmt),
        first: async () => (sql.startsWith("select") && rows.has(String(args[0])) ? { body: rows.get(String(args[0])) } : null),
        run: async () => {
          if (sql.startsWith("insert")) rows.set(String(args[0]), String(args[1]));
          if (sql.startsWith("delete")) rows.clear();
          return {};
        },
      };
      return stmt;
    },
  };
  return { rows, d1: d1 as unknown as D1Database };
}

function appWith(status = 200) {
  let calls = 0;
  const app = new Hono<{ Bindings: Env }>().get("/x", cached(), (c) => {
    calls++;
    return c.json({ n: calls }, status as 200);
  });
  return { app, calls: () => calls };
}

describe("읽기 응답 캐시 (작업 0083)", () => {
  it("같은 날 · 같은 버전 · 같은 경로는 두 번째부터 저장한 응답 (처리기를 다시 안 부름)", async () => {
    const { d1 } = fakeD1();
    const { app, calls } = appWith();
    const env = { DB: d1, CF_VERSION_METADATA: { id: "v1", tag: "", timestamp: "" } } as Env;
    const a = await app.request("/x?days=365", {}, env);
    expect(a.headers.get("x-cache")).toBe("miss");
    const b = await app.request("/x?days=365", {}, env);
    expect(b.headers.get("x-cache")).toBe("hit");
    expect(await b.json()).toEqual({ n: 1 });
    expect(b.headers.get("content-type")).toContain("application/json");
    expect(calls()).toBe(1);
  });

  it("쿼리 · 배포 버전이 다르면 다른 키", async () => {
    const { d1 } = fakeD1();
    const { app, calls } = appWith();
    await app.request("/x?days=1", {}, { DB: d1 } as Env);
    await app.request("/x?days=2", {}, { DB: d1 } as Env);
    await app.request("/x?days=2", {}, { DB: d1, CF_VERSION_METADATA: { id: "v2", tag: "", timestamp: "" } } as Env);
    expect(calls()).toBe(3);
    expect(cacheKey("v1", "2026-10-30", "https://a.dev/fx/USD/history?days=365")).toBe("v1|2026-10-30|/fx/USD/history?days=365");
  });

  it("200 이 아니면 저장 안 함", async () => {
    const { d1, rows } = fakeD1();
    const { app } = appWith(500);
    await app.request("/x", {}, { DB: d1 } as Env);
    expect(rows.size).toBe(0);
  });

  it("자료를 저장하면 비움 → 다음 요청은 새로 계산", async () => {
    const { d1 } = fakeD1();
    const { app, calls } = appWith();
    await app.request("/x", {}, { DB: d1 } as Env);
    await clearApiCache(d1);
    const r = await app.request("/x", {}, { DB: d1 } as Env);
    expect(r.headers.get("x-cache")).toBe("miss");
    expect(calls()).toBe(2);
  });

  it("캐시 표가 고장 나도 원래 응답은 나감", async () => {
    const broken = { prepare: () => { throw new Error("no such table: api_cache"); } } as unknown as D1Database;
    const { app } = appWith();
    const r = await app.request("/x", {}, { DB: broken } as Env);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ n: 1 });
  });
});
