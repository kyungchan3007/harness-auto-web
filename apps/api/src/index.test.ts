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
