// D1 저장 — collect.ts 의 RateStore 구현
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { clearApiCache } from "../../db/cache";
import { runLog } from "../../db/runs";
import { fxRates } from "../../db/schema";
import type { RateStore } from "./collect";
import type { RateRow } from "./rate";

// D1 은 쿼리 하나에 바인딩 값 100개까지 → 8칸 × 12줄 = 96
const CHUNK = 12;

export function d1RateStore(d1: D1Database): RateStore {
  const db = drizzle(d1);
  return {
    ...runLog(db),
    async saveRates(rows: RateRow[]) {
      const official = rows.some((r) => r.source === "koreaexim");
      for (let i = 0; i < rows.length; i += CHUNK) {
        const q = db.insert(fxRates).values(rows.slice(i, i + CHUNK));
        await (official
          ? q.onConflictDoUpdate({
              target: [fxRates.date, fxRates.currency],
              set: {
                unit: sql`excluded.unit`,
                baseRate: sql`excluded.base_rate`,
                ttb: sql`excluded.ttb`,
                tts: sql`excluded.tts`,
                source: sql`excluded.source`,
                fetchedAt: sql`excluded.fetched_at`,
              },
            })
          : q.onConflictDoNothing());
      }
      if (rows.length > 0) await clearApiCache(d1); // 새 환율 → 저장해 둔 응답은 낡음
      return rows.length;
    },
  };
}

/** 그 날짜 환율이 하나라도 있는지 — 기본 키(날짜, 통화) 앞부분이라 한 줄만 읽음 (작업 0094) */
export async function hasRates(d1: D1Database, date: string): Promise<boolean> {
  return (await d1.prepare("select 1 as x from fx_rates where date = ? limit 1").bind(date).first()) !== null;
}

/** 가장 최근 기준일의 모든 통화 */
export async function latestRates(d1: D1Database) {
  const db = drizzle(d1);
  const [last] = await db.select({ date: fxRates.date }).from(fxRates).orderBy(desc(fxRates.date)).limit(1);
  if (!last) return { date: null, rates: [] };
  const rates = await db.select().from(fxRates).where(eq(fxRates.date, last.date)).orderBy(fxRates.currency);
  return { date: last.date, rates };
}

/** 모든 통화의 기준일 이후 값 — 기본 키(날짜, 통화) 앞부분으로 그 기간만 읽음 (작업 0096) */
export async function ratesSince(d1: D1Database, since: string) {
  const db = drizzle(d1);
  return db.select({ currency: fxRates.currency, date: fxRates.date, baseRate: fxRates.baseRate, unit: fxRates.unit }).from(fxRates).where(gte(fxRates.date, since));
}

/** 한 통화의 기준일 이후 값 (오래된 것부터) */
export async function rateHistory(d1: D1Database, currency: string, since: string) {
  const db = drizzle(d1);
  return db
    .select({ date: fxRates.date, unit: fxRates.unit, baseRate: fxRates.baseRate, ttb: fxRates.ttb, tts: fxRates.tts, source: fxRates.source })
    .from(fxRates)
    .where(and(eq(fxRates.currency, currency), gte(fxRates.date, since)))
    .orderBy(fxRates.date);
}
