// 신호 API — 저장된 환율로 그때그때 계산 (따로 저장하지 않음: 계산 규칙이 바뀌어도 원본만 있으면 됨)
import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { CurrencyParam } from "@hav/shared/fx";
import type { CurrencySignal, SignalList } from "@hav/shared/signal";
import { Hono } from "hono";
import { cached } from "../../db/cache";
import { fxRates } from "../../db/schema";
import type { Env } from "../../env";
import { validate } from "../../validate";
import { SIGNAL_RULE, computeSignal } from "./signal";

const since = () => new Date(Date.now() - (SIGNAL_RULE.windowDays + 30) * 86400_000).toISOString().slice(0, 10);

/** 1 외화당 원 — 엔처럼 100 단위 고시도, 출처마다 단위가 달라도 같은 기준으로 (FX-04) */
const perUnit = (r: { baseRate: number; unit: number }) => r.baseRate / r.unit;

export const signalRoutes = new Hono<{ Bindings: Env }>()
  .get("/", cached(), async (c) => {
    const db = drizzle(c.env.DB);
    const rows = await db.select().from(fxRates).where(gte(fxRates.date, since())).orderBy(fxRates.currency, fxRates.date);
    const byCurrency = new Map<string, { date: string; value: number }[]>();
    for (const r of rows) byCurrency.set(r.currency, [...(byCurrency.get(r.currency) ?? []), { date: r.date, value: perUnit(r) }]);
    const signals = [...byCurrency].map(([currency, points]) => {
      const { signal, reason, percentile, latest } = computeSignal(points);
      return { currency, signal, reason, percentile, latest };
    });
    const body: SignalList = { rule: SIGNAL_RULE, signals };
    return c.json(body);
  })
  .get("/:currency", validate("param", CurrencyParam), cached(), async (c) => {
    const { currency } = c.req.valid("param");
    const db = drizzle(c.env.DB);
    const rows = await db
      .select({ date: fxRates.date, baseRate: fxRates.baseRate, unit: fxRates.unit })
      .from(fxRates)
      .where(and(eq(fxRates.currency, currency), gte(fxRates.date, since())))
      .orderBy(desc(fxRates.date));
    const body: CurrencySignal = { currency, rule: SIGNAL_RULE, ...computeSignal(rows.map((r) => ({ date: r.date, value: perUnit(r) }))) };
    return c.json(body);
  });
