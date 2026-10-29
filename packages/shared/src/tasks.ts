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

/** 작업 하나의 막힘 — blocked: 하네스가 막음 · failed: 게이트 실패 (작업 0075) */
export const TaskSnag = z.object({ blocked: z.number().int().nonnegative(), failed: z.number().int().nonnegative() });
export type TaskSnag = z.infer<typeof TaskSnag>;

/** GET /tasks — names: 작업 번호 → 이름 (저장소 주인이 연 이슈에서) · done: 머지된 PR 최근부터 */
export const TasksSummary = z.object({
  names: z.record(z.string(), z.string()),
  done: z.array(DoneTask),
  /** 마지막으로 GitHub 에서 받은 때 — 한 번도 안 받았으면 null */
  syncedAt: IsoDateTime.nullable(),
  /** 작업 번호 → 막힘 수 (막힘이 있었던 작업만) · 예전 응답에는 없어서 기본값 */
  snags: z.record(z.string(), TaskSnag).default({}),
  /** 막힘을 세기 시작한 때 (그 전 기록은 지워져 모름) · 하나도 없으면 null */
  snagsSince: IsoDateTime.nullable().default(null),
});
export type TasksSummary = z.infer<typeof TasksSummary>;

/** 블록 탑 순서(아래 = 가장 오래된 머지)로 · 그 PR 의 작업에 막힘이 있었으면 true (작업 0075) — 한 작업의 PR 이 여럿이면 모두 */
export function blockMarks(done: Pick<DoneTask, "task" | "mergedAt">[], snags: TasksSummary["snags"]): boolean[] {
  return [...done].sort((a, b) => a.mergedAt.localeCompare(b.mergedAt)).map((d) => (d.task ? (snags[d.task]?.blocked ?? 0) + (snags[d.task]?.failed ?? 0) > 0 : false));
}

/** 블록 탑 밑 설명 — 색만으로 전하지 않게 빨간 블록 수 · 언제부터 센 것인지 (그 전 기록은 지워져 모름) */
export function snagText(marks: boolean[], since: string | null): string {
  const red = marks.filter(Boolean).length;
  const from = since ? `${new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(since))} 기록부터 셈` : "아직 센 기록 없음";
  return red > 0 ? `빨간 블록 ${red}개 = 하네스가 막았거나 게이트가 실패했던 작업 · ${from}` : `빨간 블록 없음 — 하네스가 막거나 게이트가 실패한 작업이 없음 · ${from}`;
}
