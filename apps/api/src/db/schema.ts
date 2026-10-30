// D1 테이블 — 원본은 여기 하나 (마이그레이션은 drizzle-kit 이 이 파일에서 만든다)
// Drizzle 은 D1 · Postgres 둘 다 지원 → 나중에 옮길 때 이 파일의 sqlite-core 만 pg-core 로 바꾼다
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  // (통화, 날짜) 색인 — 기본 키(날짜, 통화)로는 "한 통화의 1년" 을 찾을 때 1년치 모든 통화를 읽어서 D1 하루 읽기 한도를 넘겼음 (작업 0077)
  (t) => [primaryKey({ columns: [t.date, t.currency] }), index("fx_rates_currency_date").on(t.currency, t.date)],
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

/** 실시간 작업 기록 — 공개 (에이전트 훅이 보냄 · 최근 ACTIVITY_KEEP 개만 남김) · 명령 · 경로 · 내용은 저장하지 않음 */
export const activityEvents = sqliteTable("activity_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  at: text("at").notNull(),
  kind: text("kind").notNull(), // @hav/shared/activity ACTIVITY_KINDS
  label: text("label").notNull(), // 고정된 한국어 문장
  file: text("file"), // 파일 이름만
  ok: integer("ok", { mode: "boolean" }),
  task: text("task"), // NNNN
});

/** 작업별 막힘 수 — 실시간 기록은 최근 500줄만 남아서 따로 쌓음 (작업 0075) · 기록이 들어올 때 +1 */
export const taskSnags = sqliteTable("task_snags", {
  task: text("task").primaryKey(), // NNNN
  blocked: integer("blocked").notNull().default(0), // 하네스가 막음
  failed: integer("failed").notNull().default(0), // 게이트 실패
  since: text("since").notNull(), // 이 작업의 막힘을 처음 센 때
  updatedAt: text("updated_at").notNull(),
});

/** 읽기 응답 캐시 — 빌드가 같은 날 같은 응답을 여러 번 받아도 D1 은 한 줄만 읽게 (작업 0083 · src/db/cache.ts) · 환율 · 물가를 저장하면 비움 */
export const apiCache = sqliteTable("api_cache", {
  key: text("key").primaryKey(), // 배포 버전 | UTC 날짜 | 경로?쿼리
  body: text("body").notNull(), // 응답 JSON 그대로
  savedAt: text("saved_at").notNull(),
});

/** GitHub 이슈 · 머지된 PR — GitHub Actions(sync-tasks.yml)가 통째로 바꿔 넣음 · 만드는 중 페이지의 지난 작업 · 작업 이름 */
export const githubItems = sqliteTable("github_items", {
  number: integer("number").primaryKey(), // 이슈 · PR 번호 (GitHub 에서 서로 겹치지 않음)
  kind: text("kind", { enum: ["issue", "pr"] }).notNull(),
  task: text("task"), // 제목의 [NNNN]
  name: text("name").notNull(),
  url: text("url").notNull(),
  mergedAt: text("merged_at"), // PR 만
  syncedAt: text("synced_at").notNull(),
});
