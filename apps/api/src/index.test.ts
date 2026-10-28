import { describe, expect, it } from "vitest";
import type { Env } from "./env";
import { app } from "./index";

const envWith = (first: () => Promise<unknown>) =>
  ({ DB: { prepare: () => ({ first }) } }) as unknown as Env;

describe("GET /health", () => {
  it("DB 가 응답하면 200 · ok", async () => {
    const res = await app.request("/health", {}, envWith(async () => ({ ok: 1 })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, service: "hav-api", db: true });
  });

  it("DB 가 실패하면 503 · ok false (숨기지 않음)", async () => {
    const res = await app.request("/health", {}, envWith(async () => { throw new Error("down"); }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, db: false });
  });
});

describe("Cron 설정", () => {
  it("wrangler.jsonc 의 crons 와 코드의 CRON 이 같다 (한쪽만 바꾸면 예약 실행이 엉뚱한 수집을 함)", async () => {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    const { CRON } = await import("./index");
    const jsonc = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url).href), "utf8");
    const crons = JSON.parse(/"crons":\s*(\[[^\]]*\])/.exec(jsonc)![1]);
    expect(crons.sort()).toEqual(Object.values(CRON).sort());
  });
});
