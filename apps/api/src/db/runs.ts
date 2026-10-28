// 수집 실행 기록 (fetch_runs) — 수집하는 슬라이스들이 같이 쓰는 저장 도구
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { fetchRuns } from "./schema";

export type RunFinish = { source: string; status: "ok" | "empty" | "error"; rows: number; message: string | null; finishedAt: string };

export function runLog(db: DrizzleD1Database) {
  return {
    async startRun(source: string, startedAt: string) {
      const [row] = await db.insert(fetchRuns).values({ source, startedAt, status: "running" }).returning({ id: fetchRuns.id });
      return row.id;
    },
    async finishRun(id: number, r: RunFinish) {
      await db.update(fetchRuns).set(r).where(eq(fetchRuns.id, id));
    },
  };
}
