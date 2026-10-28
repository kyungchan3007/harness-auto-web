// 관리용 API 확인 — ADMIN_TOKEN 이 없으면 경로가 없는 것처럼(404) · 있으면 Bearer 토큰
import type { Context } from "hono";
import type { ApiError } from "@hav/shared/errors";
import type { Env } from "./env";

/** 길이와 상관없이 같은 시간이 걸리는 비교 (토큰 추측 방지) */
export function sameToken(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** 통과면 null, 막으면 돌려줄 응답 — 토큰이 설정 안 됐으면 경로가 없는 것처럼(404) */
export function tokenGuard(c: Context<{ Bindings: Env }>, token: string | undefined): Response | null {
  if (!token) return c.notFound() as Response;
  if (!sameToken(c.req.header("authorization") ?? "", `Bearer ${token}`)) {
    const body: ApiError = { error: "인증 실패" };
    return c.json(body, 401);
  }
  return null;
}

export const adminGuard = (c: Context<{ Bindings: Env }>) => tokenGuard(c, c.env.ADMIN_TOKEN);
