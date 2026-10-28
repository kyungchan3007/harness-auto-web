import { describe, expect, it } from "vitest";
import { type Point, computeSignal, weekdaysBetween } from "./signal";

/** 끝날짜에서 거꾸로 평일마다 값을 붙인다 (values[마지막] = 끝날짜 값) */
function weekdaySeries(end: string, values: number[]): Point[] {
  const out: Point[] = [];
  let t = Date.parse(`${end}T00:00:00Z`);
  for (let i = values.length - 1; i >= 0; ) {
    const d = new Date(t).getUTCDay();
    if (d !== 0 && d !== 6) out.unshift({ date: new Date(t).toISOString().slice(0, 10), value: values[i--] });
    t -= 86400_000;
  }
  return out;
}

const END = "2026-10-28"; // 수요일
const N = weekdaysBetween("2026-07-31", END); // 90일 창의 평일 수

describe("weekdaysBetween", () => {
  it("한 주 = 평일 5일", () => {
    expect(weekdaysBetween("2026-10-26", "2026-11-01")).toBe(5);
  });
});

describe("computeSignal", () => {
  const ramp = (last: number) => [...Array.from({ length: N - 1 }, (_, i) => 1300 + i), last];

  it("90일 중 가장 낮은 값 → 싼 편 (백분위 0)", () => {
    const r = computeSignal(weekdaySeries(END, ramp(1200)));
    expect(r).toMatchObject({ signal: "cheap", percentile: 0, reason: "ok" });
    expect(r.window).toMatchObject({ from: "2026-07-31", to: END, count: N, expected: N });
  });

  it("가장 높은 값 → 비싼 편 (백분위 1)", () => {
    expect(computeSignal(weekdaySeries(END, ramp(2000)))).toMatchObject({ signal: "expensive", percentile: 1 });
  });

  it("가운데 → 보통", () => {
    expect(computeSignal(weekdaySeries(END, ramp(1300 + N / 2))).signal).toBe("normal");
  });

  it("경계: 30% 는 싼 편 · 70% 는 비싼 편 (이하 · 이상)", () => {
    const flat = (lowerShare: number) => {
      const others = 10;
      const lower = Math.round(others * lowerShare);
      return computeSignal(
        weekdaySeries("2026-10-28", [...Array(lower).fill(1), ...Array(others - lower).fill(3), 2]),
        { windowDays: 15, cheapAt: 0.3, expensiveAt: 0.7, minCoverage: 0.8 },
      );
    };
    expect(flat(0.3)).toMatchObject({ percentile: 0.3, signal: "cheap" });
    expect(flat(0.7)).toMatchObject({ percentile: 0.7, signal: "expensive" });
  });

  it("90일 창보다 오래된 값은 계산에 안 넣음", () => {
    const old: Point = { date: "2026-01-02", value: 1 }; // 아주 싼 옛날 값
    const r = computeSignal([old, ...weekdaySeries(END, ramp(1200))]);
    expect(r.window?.count).toBe(N);
    expect(r.percentile).toBe(0);
  });

  it("영업일 80% 미만이면 신호 없음 (SIG-03)", () => {
    const short = weekdaySeries(END, ramp(1200)).filter((_, i) => i % 2 === 0);
    expect(computeSignal(short)).toMatchObject({ signal: null, reason: "data-short", percentile: null });
  });

  it("데이터 없음 · 계산 방법은 항상 같이 (SIG-02)", () => {
    const r = computeSignal([]);
    expect(r).toMatchObject({ signal: null, reason: "no-data" });
    expect(r.method).toMatch(/예측 아님/);
  });
});
