import { describe, expect, it } from "vitest";
import { budgetOf, localText, parseDaily, parseDays, wonText } from "./budget";

describe("여행 예산 어림 (작업 0088)", () => {
  it("물가 수준을 곱하고 · 일수를 곱함", () => {
    const b = budgetOf(100_000, 4, 1.12, 8.4689);
    expect(b.dailyWon).toBeCloseTo(112_000);
    expect(b.totalWon).toBeCloseTo(448_000);
    expect(b.dailyLocal!).toBeCloseTo(112_000 / 8.4689, 2);
  });
  it("오늘 환율이 없으면 현지 통화는 null (지어내지 않음)", () => {
    const b = budgetOf(100_000, 3, 0.6, null);
    expect(b.dailyLocal).toBeNull();
    expect(b.totalLocal).toBeNull();
    expect(b.totalWon).toBeCloseTo(180_000);
  });
  it("하루 × 일수 = 전체 (반올림이 어긋나지 않음)", () => {
    const b = budgetOf(100_000, 4, 1.1149, 8.47);
    expect(b.dailyWon).toBe(111_000);
    expect(b.totalWon).toBe(444_000);
  });
  it("표시 — 원은 천 원 단위 · 현지 통화는 크기에 맞춰", () => {
    expect(wonText(112_345)).toBe("112,000원");
    expect(localText(13_224.8, "JPY")).toBe("13,225 JPY");
    expect(localText(74.836, "USD")).toBe("74.84 USD");
  });
  it("입력 검사", () => {
    expect(parseDaily("100,000")).toBe(100_000);
    expect(parseDaily("0")).toBeNull();
    expect(parseDaily("1.5")).toBeNull();
    expect(parseDays("4")).toBe(4);
    expect(parseDays("0")).toBeNull();
    expect(parseDays("91")).toBeNull();
  });
});
