// 작업 목록 API — 읽기만 (쓰기는 GitHub Actions 가 D1 에 바로) · 모양은 @hav/shared/tasks
import type { TasksSummary } from "@hav/shared/tasks";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { githubItems, taskSnags } from "../../db/schema";
import type { Env } from "../../env";

/** 행 → 응답 — 이름은 같은 작업 번호면 가장 최근 이슈 · 지난 작업은 머지 최근부터 · 막힘은 0 보다 큰 작업만 */
export function summarize(rows: (typeof githubItems.$inferSelect)[], snagRows: (typeof taskSnags.$inferSelect)[] = []): TasksSummary {
  const names: Record<string, string> = {};
  for (const r of [...rows].sort((a, b) => a.number - b.number)) if (r.kind === "issue" && r.task) names[r.task] = r.name;
  const done = rows
    .filter((r): r is typeof r & { mergedAt: string } => r.kind === "pr" && r.mergedAt !== null)
    .map((r) => ({ number: r.number, task: r.task, name: r.name, url: r.url, mergedAt: r.mergedAt }))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
  const syncedAt = rows.reduce<string | null>((m, r) => (m === null || r.syncedAt > m ? r.syncedAt : m), null);
  const snags: TasksSummary["snags"] = {};
  for (const s of snagRows) if (s.blocked + s.failed > 0) snags[s.task] = { blocked: s.blocked, failed: s.failed };
  const snagsSince = snagRows.reduce<string | null>((m, s) => (m === null || s.since < m ? s.since : m), null);
  return { names, done, syncedAt, snags, snagsSince };
}

export const taskRoutes = new Hono<{ Bindings: Env }>().get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const [rows, snagRows] = await Promise.all([db.select().from(githubItems).orderBy(desc(githubItems.number)), db.select().from(taskSnags)]);
  c.header("cache-control", "public, max-age=60");
  return c.json(summarize(rows, snagRows));
});
