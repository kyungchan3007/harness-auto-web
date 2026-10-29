// D1 저장 · 읽기 — 실시간 작업 기록
import { ACTIVITY_KEEP, type ActivityEvent, type ActivityIn, snagOf } from "@hav/shared/activity";
import { desc, gt, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { activityEvents, taskSnags } from "../../db/schema";

export type ActivityStore = {
  add(e: ActivityIn, at: string): Promise<ActivityEvent>;
  list(limit: number, after?: number): Promise<ActivityEvent[]>;
};

const toEvent = (r: typeof activityEvents.$inferSelect): ActivityEvent => ({ ...r, kind: r.kind as ActivityEvent["kind"] });

export function d1ActivityStore(d1: D1Database, keep = ACTIVITY_KEEP): ActivityStore {
  const db = drizzle(d1);
  return {
    async add(e, at) {
      const [row] = await db.insert(activityEvents).values({ ...e, at }).returning();
      // 막힘은 작업별로 따로 쌓음 — 아래에서 기록을 지워도 남게 (작업 0075)
      const snag = snagOf(e);
      if (snag && e.task) {
        await db
          .insert(taskSnags)
          .values({ task: e.task, blocked: snag === "blocked" ? 1 : 0, failed: snag === "failed" ? 1 : 0, since: at, updatedAt: at })
          .onConflictDoUpdate({
            target: taskSnags.task,
            set: snag === "blocked" ? { blocked: sql`${taskSnags.blocked} + 1`, updatedAt: at } : { failed: sql`${taskSnags.failed} + 1`, updatedAt: at },
          });
      }
      // 오래된 기록 지움 — 새 id 기준 keep 개만
      await db.delete(activityEvents).where(lte(activityEvents.id, row.id - keep));
      return toEvent(row);
    },
    async list(limit, after) {
      const q = db.select().from(activityEvents);
      const rows = await (after === undefined ? q : q.where(gt(activityEvents.id, after))).orderBy(desc(activityEvents.id)).limit(limit);
      return rows.map(toEvent);
    },
  };
}
