// 1년 흐름 그래프 좌표 — 순수 함수 (테스트 있음) · 받은 날만 잇고 빈 날은 만들지 않음 (FX-02)
import { rangeOf } from "@hav/shared/currency";

type Day = { date: string; baseRate: number };
export type Dot = { x: number; y: number; date: string; value: number };

export function chartOf(rates: Day[], w: number, h: number, pad = 8): { path: string; min: Dot; max: Dot; last: Dot } | null {
  const r = rangeOf(rates);
  if (!r || r.count < 2) return null;
  const sorted = [...rates].sort((a, b) => a.date.localeCompare(b.date));
  const t0 = Date.parse(r.first.date);
  const span = Math.max(1, Date.parse(r.last.date) - t0);
  const lo = r.min.baseRate;
  const hi = r.max.baseRate;
  const x = (d: string) => pad + ((Date.parse(d) - t0) / span) * (w - pad * 2);
  // 값이 모두 같으면 가운데 한 줄
  const y = (v: number) => (hi === lo ? h / 2 : pad + (1 - (v - lo) / (hi - lo)) * (h - pad * 2));
  const dot = (d: Day): Dot => ({ x: round(x(d.date)), y: round(y(d.baseRate)), date: d.date, value: d.baseRate });
  const path = sorted.map((d, i) => `${i ? "L" : "M"}${round(x(d.date))},${round(y(d.baseRate))}`).join(" ");
  return { path, min: dot(r.min), max: dot(r.max), last: dot(r.last) };
}

const round = (n: number) => Math.round(n * 10) / 10;
