// 작업 목록 API 계약 — GitHub Actions 가 D1 에 저장한 이슈 · 머지된 PR 을 만드는 중 페이지가 읽음
import { z } from "zod";
import { IsoDateTime } from "./date";

export const DoneTask = z.object({
  number: z.number().int().positive(),
  task: z.string().nullable(),
  name: z.string(),
  url: z.string(),
  mergedAt: IsoDateTime,
});
export type DoneTask = z.infer<typeof DoneTask>;

/** GET /tasks — names: 작업 번호 → 이름 (저장소 주인이 연 이슈에서) · done: 머지된 PR 최근부터 */
export const TasksSummary = z.object({
  names: z.record(z.string(), z.string()),
  done: z.array(DoneTask),
  /** 마지막으로 GitHub 에서 받은 때 — 한 번도 안 받았으면 null */
  syncedAt: IsoDateTime.nullable(),
});
export type TasksSummary = z.infer<typeof TasksSummary>;
