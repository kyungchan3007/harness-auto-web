import { describe, expect, it } from "vitest";
import { chartOf } from "./chart";

describe("1년 흐름 그래프 좌표", () => {
  it("첫날은 왼쪽 · 마지막 날은 오른쪽 · 최고는 위 · 최저는 아래", () => {
    const c = chartOf(
      [
        { date: "2026-01-01", baseRate: 1400 },
        { date: "2026-01-03", baseRate: 1500 },
        { date: "2026-01-05", baseRate: 1300 },
      ],
      100,
      50,
      0,
    )!;
    expect(c.path).toBe("M0,25 L50,0 L100,50");
    expect(c.max).toMatchObject({ x: 50, y: 0, value: 1500 });
    expect(c.min).toMatchObject({ x: 100, y: 50, value: 1300 });
    expect(c.last).toEqual(c.min);
  });

  it("날짜 순서가 섞여 와도 날짜순으로 이음", () => {
    const c = chartOf(
      [
        { date: "2026-01-05", baseRate: 1300 },
        { date: "2026-01-01", baseRate: 1400 },
      ],
      100,
      50,
      0,
    )!;
    expect(c.path).toBe("M0,0 L100,50");
  });

  it("값이 모두 같으면 가운데 한 줄", () => {
    const c = chartOf(
      [
        { date: "2026-01-01", baseRate: 1 },
        { date: "2026-01-02", baseRate: 1 },
      ],
      100,
      50,
      0,
    )!;
    expect(c.path).toBe("M0,25 L100,25");
  });

  it("이틀 미만이면 그리지 않음 (선이 안 됨)", () => {
    expect(chartOf([], 100, 50)).toBeNull();
    expect(chartOf([{ date: "2026-01-01", baseRate: 1 }], 100, 50)).toBeNull();
  });
});

import { codeFromPath } from "./route";

describe("주소 → 통화", () => {
  it("/currencies 는 달러 · /currencies/jpy/ 는 JPY · 다른 주소는 달러", () => {
    expect(codeFromPath("/currencies")).toBe("USD");
    expect(codeFromPath("/currencies/jpy/")).toBe("JPY");
    expect(codeFromPath("/currencies/JPY")).toBe("JPY");
    expect(codeFromPath("/currencies/JPY.html")).toBe("JPY");
    expect(codeFromPath(null)).toBe("USD");
    expect(codeFromPath("/currencies/abcd")).toBe("USD");
  });
});
