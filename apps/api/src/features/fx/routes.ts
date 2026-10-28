// 환율 API — 읽기는 누구나 · 수집은 관리 토큰이 있을 때만 · 요청 · 응답 모양은 @hav/shared/fx
import { type CollectResult, CollectQuery, CurrencyParam, type FxHistory, FxHistoryQuery, type FxLatest } from "@hav/shared/fx";
import { Hono } from "hono";
import { adminGuard } from "../../admin";
import type { Env } from "../../env";
import { validate } from "../../validate";
import { collectDay } from "./collect";
import { kstDate } from "./rate";
import { d1RateStore, latestRates, rateHistory } from "./store";

export const fxRoutes = new Hono<{ Bindings: Env }>()
  .get("/latest", async (c) => {
    const body: FxLatest = await latestRates(c.env.DB);
    return c.json(body);
  })
  .get("/:currency/history", validate("param", CurrencyParam), validate("query", FxHistoryQuery), async (c) => {
    const { currency } = c.req.valid("param");
    const { days } = c.req.valid("query");
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
    const body: FxHistory = { currency, since, rates: await rateHistory(c.env.DB, currency, since) };
    return c.json(body);
  })
  // 과거 날짜 채우기 · 수동 재수집 — ADMIN_TOKEN 이 없으면 경로 자체가 없는 것처럼 (404)
  .post("/collect", validate("query", CollectQuery), async (c) => {
    const blocked = adminGuard(c);
    if (blocked) return blocked;
    const date = c.req.valid("query").date ?? kstDate();
    const body: CollectResult = await collectDay(d1RateStore(c.env.DB), date, { koreaeximKey: c.env.KOREAEXIM_KEY });
    return c.json(body);
  });
