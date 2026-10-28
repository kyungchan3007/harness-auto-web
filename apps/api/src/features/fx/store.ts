// D1 저장 — collect.ts 의 RateStore 구현
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { fetchRuns, fxRates } from "../../db/schema";
import type { RateStore } from "./collect";
import type { RateRow } from "./rate";

// D1 은 쿼리 하나에 바인딩 값 100개까지 → 8칸 × 12줄 = 96
const CHUNK = 12;

export function d1RateStore(d1: D1Database): RateStore {
  const db = drizzle(d1);
  return {
    async startRun(source, startedAt) {
      const [row] = await db.insert(fetchRuns).values({ source, startedAt, status: "running" }).returning({ id: fetchRuns.id });
      return row.id;
    },
    async finishRun(id, r) {
      await db.update(fetchRuns).set(r).where(eq(fetchRuns.id, id));
    },
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
      return rows.length;
    },
  };
}

/** 가장 최근 기준일의 모든 통화 */
export async function latestRates(d1: D1Database) {
  const db = drizzle(d1);
  const [last] = await db.select({ date: fxRates.date }).from(fxRates).orderBy(desc(fxRates.date)).limit(1);
  if (!last) return { date: null, rates: [] };
  const rates = await db.select().from(fxRates).where(eq(fxRates.date, last.date)).orderBy(fxRates.currency);
  return { date: last.date, rates };
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
