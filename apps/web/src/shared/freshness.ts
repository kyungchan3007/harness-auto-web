// 환율이 오늘 값인지 — 사이트는 빌드할 때의 값을 보여 줘서, 수집 · 다시 빌드가 늦으면 어제 값이 오늘 값처럼 보임 (작업 0095)
//   브라우저에서 지금 한국 시각과 비교해 왜 그 날짜인지 알려 줌 · 값을 바꾸지는 않음 (FX-02 지어내지 않음)
//   2026-10-30: 12:00 예약 수집이 돌지 않았는데 사이트는 아무 말 없이 10-29 값을 보여 줌

const KST = 9 * 3600_000;
/** 수출입은행 고시(11시 전후) + 수집(12:00) + 다시 빌드 몇 분 → 13:00 KST 부터 "늦음" */
const READY_HOUR = 13;

export type Freshness = { kind: "today" } | { kind: "before-release" | "late" | "no-release"; text: string };

const md = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}월 ${d}일`;
};

export function freshness(date: string, now: Date = new Date()): Freshness {
  const k = new Date(now.getTime() + KST);
  const today = k.toISOString().slice(0, 10);
  if (date >= today) return { kind: "today" };
  const day = k.getUTCDay();
  if (day === 0 || day === 6) return { kind: "no-release", text: `주말에는 고시가 없어 ${md(date)} 값입니다` };
  if (k.getUTCHours() < READY_HOUR) return { kind: "before-release", text: `오늘 환율은 낮 12시쯤 나옵니다 · 지금은 ${md(date)} 값입니다` };
  return { kind: "late", text: `오늘(${md(today)}) 값 반영이 늦어지고 있습니다 · 지금은 ${md(date)} 값입니다 (공휴일이면 고시가 없습니다)` };
}
