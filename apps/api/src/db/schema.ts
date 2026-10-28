// D1 테이블 — 원본은 여기 하나 (마이그레이션은 drizzle-kit 이 이 파일에서 만든다)
// Drizzle 은 D1 · Postgres 둘 다 지원 → 나중에 옮길 때 이 파일의 sqlite-core 만 pg-core 로 바꾼다
import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 일별 환율 (원화 기준). 받지 못한 날은 행을 만들지 않는다 (FX-02) */
export const fxRates = sqliteTable(
  "fx_rates",
  {
    date: text("date").notNull(), // 기준일 YYYY-MM-DD
    currency: text("currency").notNull(), // ISO 4217 (USD · JPY …)
    unit: integer("unit").notNull().default(1), // 고시 단위 — 엔 · 루피아는 100 (FX-04)
    baseRate: real("base_rate").notNull(), // 매매기준율 (unit 당 원)
    ttb: real("ttb"), // 송금 받을 때 — 출처에 없으면 null
    tts: real("tts"), // 송금 보낼 때 — 출처에 없으면 null
    source: text("source", { enum: ["koreaexim", "frankfurter"] }).notNull(), // FX-01
    fetchedAt: text("fetched_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.date, t.currency] })],
);

/** 나라별 물가 수준 (미국 = 1, 연 단위). 출처 없는 나라는 넣지 않는다 (TRV-02) */
export const priceLevels = sqliteTable(
  "price_levels",
  {
    country: text("country").notNull(), // ISO 3166-1 alpha-3
    year: integer("year").notNull(),
    level: real("level").notNull(),
    source: text("source").notNull(),
    fetchedAt: text("fetched_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.country, t.year] })],
);

/** 수집 실행 기록 — 운영용 (공개 일지 아님) */
export const fetchRuns = sqliteTable("fetch_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  status: text("status", { enum: ["running", "ok", "empty", "error"] }).notNull(),
  rows: integer("rows").notNull().default(0),
  message: text("message"),
});
