import { ActivityIn, looksSecret, snagOf } from "@hav/shared/activity";
import { describe, expect, it } from "vitest";
import type { Env } from "../../env";
import { app } from "../../index";

const env = (extra: Partial<Env> = {}) => ({ DB: {} as D1Database, ...extra }) as Env;
const post = (body: unknown, token?: string) =>
  ({ method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }) as RequestInit;
const ok = { kind: "edit", label: "코드 수정", file: "store.ts", task: "0046" };

describe("POST /activity (훅만)", () => {
  it("ACTIVITY_TOKEN 이 없으면 경로가 없는 것처럼 404", async () => {
    expect((await app.request("/activity", post(ok, "x"), env())).status).toBe(404);
  });

  it("토큰이 틀리면 401 · 관리 토큰으로는 못 씀", async () => {
    expect((await app.request("/activity", post(ok, "nope"), env({ ACTIVITY_TOKEN: "act" }))).status).toBe(401);
    expect((await app.request("/activity", post(ok, "adm"), env({ ACTIVITY_TOKEN: "act", ADMIN_TOKEN: "adm" }))).status).toBe(401);
  });

  it("토큰이 맞아도 모양이 틀리면 400 (경로 · 모르는 종류)", async () => {
    const e = env({ ACTIVITY_TOKEN: "act" });
    expect((await app.request("/activity", post({ ...ok, file: "apps/api/src/store.ts" }, "act"), e)).status).toBe(400);
    expect((await app.request("/activity", post({ ...ok, kind: "hack" }, "act"), e)).status).toBe(400);
  });
});

describe("GET /activity 입력 검사", () => {
  it("limit 범위 밖 → 400", async () => {
    expect((await app.request("/activity?limit=0", {}, env())).status).toBe(400);
    expect((await app.request("/activity?limit=201", {}, env())).status).toBe(400);
  });
});

describe("공개 기록 거르기 (서버 쪽)", () => {
  it("빈 칸은 null 로 채움", () => {
    expect(ActivityIn.parse({ kind: "run", label: "명령 실행" })).toEqual({ kind: "run", label: "명령 실행", file: null, ok: null, task: null });
  });

  it("파일은 이름만 · 비밀 파일 이름은 거절", () => {
    for (const file of ["src/a.ts", "a b.ts", ".env", ".env.local", ".dev.vars", "../x"]) {
      expect(ActivityIn.safeParse({ ...ok, file }).success, file).toBe(false);
    }
    expect(ActivityIn.safeParse({ ...ok, file: "page.test.tsx" }).success).toBe(true);
  });

  it("비밀 모양 글은 거절 — 토큰 접두사 · 긴 16진수 · JWT · Bearer", () => {
    for (const s of ["ghp_abcdefghijklmnop1234", "sk-ant-abcdefghijk", "a".repeat(8) + "0123456789abcdef0123456789abcdef", "eyJhbGciOiJIUzI1NiJ9.x", "Bearer abc"]) {
      expect(looksSecret(s), s).toBe(true);
      expect(ActivityIn.safeParse({ ...ok, label: s.slice(0, 60) }).success, s).toBe(false);
    }
    expect(looksSecret("테스트 실행 · 통과")).toBe(false);
  });

  it("작업 번호는 숫자 4자리만", () => {
    expect(ActivityIn.safeParse({ ...ok, task: "46" }).success).toBe(false);
  });
});

describe("작업별 막힘 (작업 0075)", () => {
  it("하네스가 막음 · 게이트 실패만 · 작업 번호가 없으면 셀 수 없음", () => {
    expect(snagOf({ kind: "blocked", ok: false, task: "0069" })).toBe("blocked");
    expect(snagOf({ kind: "gate", ok: false, task: "0070" })).toBe("failed");
    expect(snagOf({ kind: "gate", ok: true, task: "0070" })).toBeNull();
    expect(snagOf({ kind: "gate", ok: null, task: "0070" })).toBeNull();
    expect(snagOf({ kind: "test", ok: false, task: "0070" })).toBeNull();
    expect(snagOf({ kind: "blocked", ok: false, task: null })).toBeNull();
  });
});
