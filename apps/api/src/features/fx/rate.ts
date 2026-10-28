// 환율 한 줄 — 출처가 달라도 D1 에 넣기 전엔 이 모양으로 맞춘다 (schema.ts fxRates 와 같은 칸)
export type RateRow = {
  date: string; // 기준일 YYYY-MM-DD
  currency: string; // ISO 4217
  unit: number; // 고시 단위 (엔 · 루피아 100)
  baseRate: number; // unit 당 원
  ttb: number | null;
  tts: number | null;
  source: "koreaexim" | "frankfurter";
  fetchedAt: string;
};

/** 출처가 "데이터 없음"이 아니라 "실패"를 알렸을 때 — 예비 출처로 넘어갈 이유 */
export class SourceError extends Error {
  constructor(
    readonly source: RateRow["source"],
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** 날짜 검사의 원본은 @hav/shared/date */
export { isIsoDate } from "@hav/shared/date";

/** 한국 날짜 (KST = UTC+9) */
export function kstDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** 토 · 일 (날짜만 보고 판단 — 시간대 영향 없음) */
export function isWeekend(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}
