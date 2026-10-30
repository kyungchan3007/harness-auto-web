// 환율 API — 읽기는 누구나 · 수집은 관리 토큰이 있을 때만 · 요청 · 응답 모양은 @hav/shared/fx
import { type CollectResult, CollectQuery, CurrencyParam, type FxChanges, FxChangesQuery, type FxHistory, FxHistoryQuery, type FxLatest } from "@hav/shared/fx";
import { Hono } from "hono";
import { adminGuard } from "../../admin";
import { cached } from "../../db/cache";
import type { Env } from "../../env";
import { validate } from "../../validate";
import { changesOf } from "./changes";
import { collectDay } from "./collect";
import { ensureToday } from "./ensure";
import { kstDate } from "./rate";
import { d1RateStore, hasRates, lastFxRunAt, latestRates, rateHistory, ratesSince } from "./store";

export const fxRoutes = new Hono<{ Bindings: Env }>()
  .get("/latest", cached(), async (c) => {
    const body: FxLatest = await latestRates(c.env.DB);
    return c.json(body);
  })
  // 통화마다 기간 변화율 — 홈 통화 칸 (작업 0096)
  .get("/changes", validate("query", FxChangesQuery), cached(), async (c) => {
    const { days } = c.req.valid("query");
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    const body: FxChanges = { days, since, changes: changesOf(await ratesSince(c.env.DB, since)) };
    return c.json(body);
  })
  .get("/:currency/history", validate("param", CurrencyParam), validate("query", FxHistoryQuery), cached(), async (c) => {
    const { currency } = c.req.valid("param");
    const { days } = c.req.valid("query");
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    const body: FxHistory = { currency, since, rates: await rateHistory(c.env.DB, currency, since) };
    return c.json(body);
  })
  // 오늘 환율이 없으면 수집 — 예약(cron)이 안 돌아도 GitHub Actions 가 불러 메움 (작업 0106) · 토큰 없이 · 20분에 한 번까지
  .post("/ensure-today", async (c) => {
    const db = c.env.DB;
    const r = await ensureToday({
      store: d1RateStore(db),
      hasRates: (date) => hasRates(db, date),
      lastRunAt: () => lastFxRunAt(db),
      koreaeximKey: c.env.KOREAEXIM_KEY,
      deployHook: c.env.PAGES_DEPLOY_HOOK,
    });
    // 결과에는 출처 메시지를 넣지 않음 (공개 경로)
    return c.json(r.done && !r.skipped ? { done: true, status: r.status, rows: r.rows, rebuild: r.rebuild } : r, 200, { "cache-control": "no-store" });
  })
  // 과거 날짜 채우기 · 수동 재수집 — ADMIN_TOKEN 이 없으면 경로 자체가 없는 것처럼 (404)
  .post("/collect", validate("query", CollectQuery), async (c) => {
    const blocked = adminGuard(c);
    if (blocked) return blocked;
    const date = c.req.valid("query").date ?? kstDate();
    const body: CollectResult = await collectDay(d1RateStore(c.env.DB), date, { koreaeximKey: c.env.KOREAEXIM_KEY });
    return c.json(body);
  });
