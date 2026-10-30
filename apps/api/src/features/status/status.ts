// 사이트 상태 — 수집 기록 · 최신 환율 날짜 · 오늘 예약 회차가 돌았는지 (작업 0105)
//   2026-10-30 12:00 · 13:30 예약이 아예 돌지 않았는데 화면에서는 알 수 없었음
import type { SiteStatus, SlotState, StatusRun, StatusSlot } from "@hav/shared/status";

export type RunRow = { startedAt: string; source: string; status: "running" | "ok" | "empty" | "error"; rows: number; message: string | null };
export type Slot = { cron: string; kind: "collect" | "retry" };

const KST = 9 * 3600_000;
const kst = (d: Date) => new Date(d.getTime() + KST);
const kstDay = (iso: string) => kst(new Date(iso)).toISOString().slice(0, 10);

/** 수집 코드의 메시지 "koreaexim no-key: 키 없음" → "no-key" (원본 글은 내보내지 않음) */
export function reasonOf(message: string | null): string | null {
  const m = message?.match(/^(?:koreaexim|frankfurter|worldbank)\s+([a-z0-9-]{1,32}):/);
  return m ? m[1] : null;
}

const toRun = (r: RunRow): StatusRun => ({ at: r.startedAt, source: r.source, status: r.status, rows: r.rows, reason: reasonOf(r.message) });

/** 평일 cron "분 시 * * 1-5" (UTC) → 한국 시각 */
function slotTime(cron: string): string {
  const [m, h] = cron.split(" ").map(Number);
  const t = (h * 60 + m + 9 * 60) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * 오늘 예약 회차 상태
 * - 회차 시각부터 20분 안에 시작한 수집 기록 → 그 결과
 * - 기록이 없고 다시 하는 회차인데 그 전에 오늘 값이 있었으면 → not-needed (다시 하는 예약은 값이 있으면 기록 없이 끝남)
 * - 그 밖에 시각이 5분 넘게 지났으면 missed · 아니면 upcoming
 */
export function scheduleOf(slots: Slot[], runs: RunRow[], now: Date, firstRateAt: string | null): StatusSlot[] {
  const k = kst(now);
  const day = k.getUTCDay();
  if (day === 0 || day === 6) return [];
  const today = k.toISOString().slice(0, 10);
  return slots.map((s) => {
    const time = slotTime(s.cron);
    const at = Date.parse(`${today}T${time}:00+09:00`);
    const run = runs.find((r) => {
      const t = Date.parse(r.startedAt);
      return t >= at && t < at + 20 * 60_000;
    });
    let state: SlotState;
    if (run) state = run.status === "ok" || run.status === "running" ? "done" : run.status;
    else if (s.kind === "retry" && firstRateAt && Date.parse(firstRateAt) <= at) state = "not-needed";
    else if (now.getTime() < at + 5 * 60_000) state = "upcoming"; // 아직 · 막 지남(기록이 들어오는 중일 수 있음)
    else state = "missed";
    return { time, kind: s.kind, state };
  });
}

export function siteStatus(input: { now: Date; latestDate: string | null; runs: RunRow[]; slots: Slot[]; firstRateAt: string | null }): SiteStatus {
  const today = kst(input.now).toISOString().slice(0, 10);
  const fx = input.runs.filter((r) => r.source.startsWith("koreaexim"));
  return {
    today,
    now: input.now.toISOString(),
    latestDate: input.latestDate,
    lastRun: fx[0] ? toRun(fx[0]) : null,
    todayRuns: fx.filter((r) => kstDay(r.startedAt) === today).map(toRun),
    schedule: scheduleOf(input.slots, fx, input.now, input.firstRateAt),
  };
}
