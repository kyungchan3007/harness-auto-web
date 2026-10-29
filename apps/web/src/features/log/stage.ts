// 실시간 기록 → 작업 책상 단계 — 실제 기록으로만 (지어내지 않음 · 테스트 있음)
// 1 이슈 적기 → 2 작업하기 → 3 테스트 → 4 배포 · 받은 최근 줄 안에서 가장 멀리 간 단계 (뒤로 가지 않음)
import type { ActivityEvent } from "@hav/shared/activity";
import type { DoneTask } from "@hav/shared/tasks";

export const STAGES = [
  { id: "issue", icon: "📝", name: "이슈 적기", hint: "요청 원문 · 계획" },
  { id: "work", icon: "⌨️", name: "작업하기", hint: "코드 수정" },
  { id: "test", icon: "🧪", name: "테스트", hint: "게이트 · CI" },
  { id: "ship", icon: "🚀", name: "배포", hint: "머지 · 운영 확인" },
] as const;

export type Stage = 0 | 1 | 2 | 3;
export type DeskState = { task: string | null; stage: Stage; finished: boolean };

/** 작업 기록(spec) 파일 — 고쳐도 아직 "이슈 적기" */
const SPEC_FILES = new Set(["request.md", "plan.md", "prd.md", "sdd.md", "trace.md"]);
/** "GitHub 확인"(이슈 만들기 · 보기)도 종류는 pr 이라 문장으로 가림 — 문장은 .agents/scripts/activity.mjs 의 고정 문장 */
const SHIP_LABELS = new Set(["PR 만듦", "PR 머지", "브랜치 올림"]);

export function stageOf(e: ActivityEvent): Stage {
  switch (e.kind) {
    case "pr":
      return SHIP_LABELS.has(e.label) ? 3 : 0;
    case "test":
    case "gate":
    case "build":
    case "commit":
      return 2;
    case "edit":
      return e.file && SPEC_FILES.has(e.file) ? 0 : 1;
    default:
      return 0;
  }
}

/** 작업 번호가 빠진 배포 기록(머지 뒤 main 으로 돌아와 남은 "PR 머지" 등)은 바로 앞(더 오래된) 기록의 작업으로 셈
 *  훅이 고쳐지기 전(작업 0066) 기록도 맞게 보이게 — 다른 작업이 끼어 있으면 붙이지 않음 */
export function withTasks(events: ActivityEvent[]): ActivityEvent[] {
  return events.map((e, i) => {
    if (e.task || e.kind !== "pr" || !SHIP_LABELS.has(e.label)) return e;
    const before = events.slice(i + 1).find((x) => x.task);
    return before ? { ...e, task: before.task } : e;
  });
}

/** events 는 최신부터 (useActivity) · done 은 머지된 PR (useTasks) */
export function deskState(events: ActivityEvent[], done: DoneTask[]): DeskState {
  const all = withTasks(events);
  const task = all.find((e) => e.task)?.task ?? null;
  if (!task) return { task: null, stage: 0, finished: false };
  if (done.some((d) => d.task === task)) return { task, stage: 3, finished: true };
  const stage = all.filter((e) => e.task === task).reduce<Stage>((m, e) => Math.max(m, stageOf(e)) as Stage, 0);
  return { task, stage, finished: false };
}
