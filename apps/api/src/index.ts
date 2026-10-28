// Hono 앱 + 예약 실행을 한 Worker 에 (docs/architecture.md Hono 규칙)
import { Hono } from "hono";
import type { Env } from "./env";
import { activityRoutes } from "./features/activity/routes";
import { collectDay } from "./features/fx/collect";
import { kstDate } from "./features/fx/rate";
import { fxRoutes } from "./features/fx/routes";
import { d1RateStore } from "./features/fx/store";
import { collectPriceLevels } from "./features/prices/collect";
import { priceRoutes } from "./features/prices/routes";
import { d1PriceStore } from "./features/prices/store";
import { signalRoutes } from "./features/signal/routes";
import { taskRoutes } from "./features/tasks/routes";

export const app = new Hono<{ Bindings: Env }>()
  .get("/health", async (c) => {
    const db = await c.env.DB.prepare("select 1 as ok")
      .first<{ ok: number }>()
      .then((r) => r?.ok === 1)
      .catch(() => false);
    return c.json({ ok: db, service: "tripfx-api", db }, db ? 200 : 503);
  })
  .route("/fx", fxRoutes)
  .route("/signal", signalRoutes)
  .route("/prices", priceRoutes)
  .route("/activity", activityRoutes)
  .route("/tasks", taskRoutes);

/** apps/web 은 hc<AppType>() 로 부른다 (Hono RPC) */
export type AppType = typeof app;

/** wrangler.jsonc triggers.crons 와 같은 문자열 (index.test.ts 가 검사) */
export const CRON = { fxDaily: "0 3 * * 1-5", pricesMonthly: "0 4 1 * *" } as const;

export default {
  fetch: app.fetch,
  async scheduled(controller, env, ctx) {
    if (controller.cron === CRON.pricesMonthly) {
      // 매달 1일 13:00 KST — 세계은행 물가 (연 단위 자료)
      ctx.waitUntil(collectPriceLevels(d1PriceStore(env.DB)).then(() => undefined));
      return;
    }
    // 평일 12:00 KST — 오늘(한국 날짜) 환율 · 결과는 fetch_runs 에
    ctx.waitUntil(collectDay(d1RateStore(env.DB), kstDate(), { koreaeximKey: env.KOREAEXIM_KEY }).then(() => undefined));
  },
} satisfies ExportedHandler<Env>;
