import { describe, expect, it } from "vitest";
import { changeOf, changeText, sliceDays } from "./periods";

const days = (pairs: [string, number][]) => pairs.map(([date, baseRate]) => ({ date, baseRate }));

describe("환율 흐름 기간 (작업 0087)", () => {
  const rates = days([
    ["2025-10-30", 1400],
    ["2026-07-30", 1380],
    ["2026-09-30", 1350],
    ["2026-10-01", 1360],
    ["2026-10-29", 1336.3],
  ]);
  it("받은 마지막 날 기준으로 자름 (그날 포함)", () => {
    expect(sliceDays(rates, 30).map((r) => r.date)).toEqual(["2026-09-30", "2026-10-01", "2026-10-29"]);
    expect(sliceDays(rates, 365)).toHaveLength(5);
    expect(sliceDays([], 30)).toEqual([]);
  });
  it("처음 → 마지막 변화율", () => {
    const c = changeOf(sliceDays(rates, 30))!;
    expect(c.from.date).toBe("2026-09-30");
    expect(c.pct).toBeCloseTo(((1336.3 - 1350) / 1350) * 100);
  });
  it("기록이 두 날 미만이면 변화 없음 (지어내지 않음)", () => {
    expect(changeOf(days([["2026-10-29", 1336.3]]))).toBeNull();
  });
  it("문구 — 오르면 외화가 비싸짐 · 내리면 싸짐 · 아주 작으면 그대로", () => {
    expect(changeText(2.34)).toEqual({ value: "+2.3%", text: "외화가 비싸졌습니다", tone: "up" });
    expect(changeText(-1.01).tone).toBe("down");
    expect(changeText(0.01).tone).toBe("flat");
  });
});
