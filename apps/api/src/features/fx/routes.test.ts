import { describe, expect, it } from "vitest";
import type { Env } from "../../env";
import { app } from "../../index";

const env = (extra: Partial<Env> = {}) => ({ DB: {} as D1Database, ...extra }) as Env;

describe("POST /fx/collect (관리용)", () => {
  it("ADMIN_TOKEN 이 없으면 경로가 없는 것처럼 404", async () => {
    const res = await app.request("/fx/collect", { method: "POST" }, env());
    expect(res.status).toBe(404);
  });

  it("토큰이 틀리면 401", async () => {
    const res = await app.request("/fx/collect", { method: "POST", headers: { authorization: "Bearer nope" } }, env({ ADMIN_TOKEN: "t0ken" }));
    expect(res.status).toBe(401);
  });

  it("날짜 형식이 틀리면 400 (토큰 확인 전에 입력 검증)", async () => {
    const res = await app.request("/fx/collect?date=2026-02-30", { method: "POST" }, env({ ADMIN_TOKEN: "t0ken" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /fx/:currency/history 입력 검증", () => {
  it("days 범위 밖 → 400", async () => {
    expect((await app.request("/fx/USD/history?days=0", {}, env())).status).toBe(400);
    expect((await app.request("/fx/USD/history?days=5000", {}, env())).status).toBe(400);
  });
  it("통화 코드가 3글자가 아니면 400", async () => {
    expect((await app.request("/fx/US/history", {}, env())).status).toBe(400);
  });
});

describe("검사 실패 응답 모양 (ApiError 한 가지)", () => {
  it("통화 코드 · days 가 틀리면 같은 모양의 400 + 어디가 왜 틀렸는지", async () => {
    const { ApiError } = await import("@hav/shared/errors");
    for (const url of ["/fx/US/history", "/fx/USD/history?days=0", "/signal/12", "/prices/levels?base=KO"]) {
      const res = await app.request(url, {}, env());
      expect(res.status, url).toBe(400);
      const body = ApiError.parse(await res.json());
      expect(body.issues?.length, url).toBeGreaterThan(0);
    }
  });
  it("소문자 통화 코드도 받는다 (usd → USD)", async () => {
    const res = await app.request("/fx/usd/history?days=1", {}, env({ DB: { prepare: () => { throw new Error("db"); } } as unknown as D1Database }));
    expect(res.status).not.toBe(400); // 검사는 통과 · DB 는 가짜라 500
  });
});
