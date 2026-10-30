// 환율 흐름 기간 — 1개월 · 3개월 · 6개월 · 1년 (작업 0087 · 이슈 #5 "30일 · 1년 추이")
//   기간은 받은 마지막 날 기준으로 자름 · 그 기간 처음 → 마지막 변화율 (지난 값만 · 앞으로를 말하지 않음 SIG-01)
import { rangeOf } from "@hav/shared/currency";

export const PERIODS = [
  { id: "1m", label: "1개월", days: 30 },
  { id: "3m", label: "3개월", days: 91 },
  { id: "6m", label: "6개월", days: 182 },
  { id: "1y", label: "1년", days: 365 },
] as const;
export type PeriodId = (typeof PERIODS)[number]["id"];

type Day = { date: string; baseRate: number };

/** 마지막 날에서 days 일 전(그날 포함) 이후만 — 날짜는 YYYY-MM-DD (오래된 것부터) */
export function sliceDays<T extends Day>(rates: T[], days: number): T[] {
  const last = rates.at(-1);
  if (!last) return [];
  const from = new Date(Date.parse(`${last.date}T00:00:00Z`) - days * 86400_000).toISOString().slice(0, 10);
  return rates.filter((r) => r.date >= from);
}

/** 기간 처음 → 마지막 변화 — 기록이 두 날 미만이면 null */
export function changeOf(rates: Day[]): { from: Day; to: Day; pct: number } | null {
  const r = rangeOf(rates);
  if (!r || r.count < 2 || r.first.baseRate <= 0) return null;
  return { from: r.first, to: r.last, pct: ((r.last.baseRate - r.first.baseRate) / r.first.baseRate) * 100 };
}

/** "+2.3% · 외화가 비싸졌습니다" — 0.05% 미만 움직임은 "거의 그대로" */
export function changeText(pct: number): { value: string; text: string; tone: "up" | "down" | "flat" } {
  const value = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  if (Math.abs(pct) < 0.05) return { value: "0.0%", text: "거의 그대로입니다", tone: "flat" };
  return pct > 0 ? { value, text: "외화가 비싸졌습니다", tone: "up" } : { value, text: "외화가 싸졌습니다", tone: "down" };
}
