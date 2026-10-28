// Hono 앱 + 예약 실행을 한 Worker 에 (docs/architecture.md Hono 규칙)
import { Hono } from "hono";
import type { Env } from "./env";
import { collectDay } from "./features/fx/collect";
import { kstDate } from "./features/fx/rate";
import { fxRoutes } from "./features/fx/routes";
import { d1RateStore } from "./features/fx/store";

export const app = new Hono<{ Bindings: Env }>()
  .get("/health", async (c) => {
    const db = await c.env.DB.prepare("select 1 as ok")
      .first<{ ok: number }>()
      .then((r) => r?.ok === 1)
      .catch(() => false);
    return c.json({ ok: db, service: "hav-api", db }, db ? 200 : 503);
  })
  .route("/fx", fxRoutes);

/** apps/web 은 hc<AppType>() 로 부른다 (Hono RPC) */
export type AppType = typeof app;

export default {
  fetch: app.fetch,
  // 평일 12:00 KST — 오늘(한국 날짜) 환율 수집 · 결과는 fetch_runs 에
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(collectDay(d1RateStore(env.DB), kstDate(), { koreaeximKey: env.KOREAEXIM_KEY }).then(() => undefined));
  },
} satisfies ExportedHandler<Env>;
