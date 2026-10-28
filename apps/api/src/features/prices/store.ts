// D1 저장 · 읽기 — 물가 수준
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { runLog } from "../../db/runs";
import { priceLevels } from "../../db/schema";
import type { PriceStore } from "./collect";

// D1 바인딩 100개 제한 → 5칸 × 20줄
const CHUNK = 20;

export function d1PriceStore(d1: D1Database): PriceStore {
  const db = drizzle(d1);
  return {
    ...runLog(db),
    async saveLevels(rows) {
      for (let i = 0; i < rows.length; i += CHUNK) {
        await db
          .insert(priceLevels)
          .values(rows.slice(i, i + CHUNK))
          .onConflictDoUpdate({
            target: [priceLevels.country, priceLevels.year],
            set: { level: sql`excluded.level`, source: sql`excluded.source`, fetchedAt: sql`excluded.fetched_at` },
          });
      }
      return rows.length;
    },
  };
}

/**
 * 기준 나라 대비 물가 — 나라마다 기준 나라와 **같은 연도**에 둘 다 있는 가장 최근 값 (TRV-03: 연도를 같이 돌려줌)
 * relative 1.2 = 기준 나라보다 20% 비쌈
 */
export async function relativeLevels(d1: D1Database, base: string) {
  const db = drizzle(d1);
  const baseRows = await db.select().from(priceLevels).where(eq(priceLevels.country, base));
  const baseByYear = new Map(baseRows.map((r) => [r.year, r.level]));
  const all = await db.select().from(priceLevels);
  const latest = new Map<string, { country: string; year: number; level: number; relative: number; source: string }>();
  for (const r of all) {
    const b = baseByYear.get(r.year);
    if (!b) continue;
    const cur = latest.get(r.country);
    if (cur && cur.year >= r.year) continue;
    latest.set(r.country, { country: r.country, year: r.year, level: r.level, relative: Math.round((r.level / b) * 1000) / 1000, source: r.source });
  }
  return { base, rows: [...latest.values()].sort((a, b) => a.country.localeCompare(b.country)) };
}
