// Hono 앱 + 예약 실행을 한 Worker 에 (docs/architecture.md Hono 규칙)
import { Hono } from "hono";
import type { Env } from "./env";

export const app = new Hono<{ Bindings: Env }>().get("/health", async (c) => {
  const db = await c.env.DB.prepare("select 1 as ok")
    .first<{ ok: number }>()
    .then((r) => r?.ok === 1)
    .catch(() => false);
  return c.json({ ok: db, service: "hav-api", db }, db ? 200 : 503);
});

/** apps/web 은 hc<AppType>() 로 부른다 (Hono RPC) */
export type AppType = typeof app;

export default {
  fetch: app.fetch,
  // 매일 수집 — 수집 코드는 환율 출처 결정 뒤 별도 작업에서 채운다
  async scheduled() {},
} satisfies ExportedHandler<Env>;
