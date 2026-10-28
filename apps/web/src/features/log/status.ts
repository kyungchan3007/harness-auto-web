// 실시간 기록 → 화면에 보일 상태 — 순수 함수 (테스트 있음) · 기록에 없는 건 지어내지 않음
import type { ActivityEvent, ActivityKind } from "@hav/shared/activity";

/** 마지막 기록이 이 안이면 "작업 중" */
export const WORKING_WITHIN_MS = 10 * 60_000;
/** 화면에 남기는 줄 수 */
export const KEEP_LINES = 50;

export const KIND: Record<ActivityKind, { icon: string; name: string }> = {
  edit: { icon: "✏️", name: "수정" },
  read: { icon: "📖", name: "읽기" },
  search: { icon: "🔍", name: "찾기" },
  run: { icon: "▶", name: "실행" },
  test: { icon: "🧪", name: "테스트" },
  gate: { icon: "🚦", name: "게이트" },
  build: { icon: "📦", name: "빌드" },
  commit: { icon: "📝", name: "커밋" },
  pr: { icon: "🔀", name: "PR" },
  install: { icon: "📥", name: "설치" },
  browser: { icon: "🌐", name: "브라우저" },
  blocked: { icon: "🛑", name: "막힘" },
  other: { icon: "·", name: "기타" },
};

/** 새로 받은 줄을 합침 — id 로 중복 제거 · 최신부터 · KEEP_LINES 줄까지 */
export function mergeEvents(prev: ActivityEvent[], incoming: ActivityEvent[]): ActivityEvent[] {
  const byId = new Map(prev.map((e) => [e.id, e]));
  for (const e of incoming) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => b.id - a.id).slice(0, KEEP_LINES);
}

/** 3분 전 · 2시간 전 · 3일 전 */
export function agoText(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/** 한국 시각 HH:MM:SS (터미널 느낌 — "23시 18분" 이 아니라 23:18:44) */
export const clockText = (iso: string) => new Date(Date.parse(iso) + 9 * 3_600_000).toISOString().slice(11, 19);

const kstDay = (t: number) => new Date(t + 9 * 3_600_000).toISOString().slice(0, 10);

export type LiveStatus =
  | { state: "none" }
  | {
      state: "working" | "idle";
      last: ActivityEvent;
      ago: string;
      /** 마지막 기록의 작업 번호 (없으면 null) */
      task: string | null;
      /** 가장 최근 게이트 결과 — 받은 줄 안에 없으면 null */
      gate: { ok: boolean | null; at: string } | null;
    };

export function liveStatus(events: ActivityEvent[], now: number): LiveStatus {
  const last = events[0];
  if (!last) return { state: "none" };
  const age = now - Date.parse(last.at);
  const gate = events.find((e) => e.kind === "gate");
  return {
    state: age <= WORKING_WITHIN_MS ? "working" : "idle",
    last,
    ago: agoText(Math.max(0, age)),
    task: last.task ?? events.find((e) => e.task)?.task ?? null,
    gate: gate ? { ok: gate.ok, at: gate.at } : null,
  };
}

/** 오늘(한국 날짜) 숫자 — 받은 줄 안에서만 셈 */
export function todayStats(events: ActivityEvent[], now: number) {
  const today = events.filter((e) => kstDay(Date.parse(e.at)) === kstDay(now));
  return {
    lines: today.length,
    blocked: today.filter((e) => e.kind === "blocked").length,
    gatePassed: today.filter((e) => e.kind === "gate" && e.ok === true).length,
  };
}
