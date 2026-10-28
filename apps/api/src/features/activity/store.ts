// D1 저장 · 읽기 — 실시간 작업 기록
import { ACTIVITY_KEEP, type ActivityEvent, type ActivityIn } from "@hav/shared/activity";
import { desc, gt, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { activityEvents } from "../../db/schema";

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
