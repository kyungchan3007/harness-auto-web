import { describe, expect, it } from "vitest";
import { amountText, convert, convertRemit, parseInput, presets } from "./convert";

const USD = { baseRate: 1336.3, unit: 1, ttb: 1323, tts: 1349.6 };
const JPY = { baseRate: 846.89, unit: 100, ttb: 838.42, tts: 855.35 };
const FALLBACK = { baseRate: 1500, unit: 1, ttb: null, tts: null };

describe("환율 계산기 (작업 0086)", () => {
  it("원 ↔ 달러 — 매매기준율", () => {
    expect(convert(100, "foreign", USD)).toBeCloseTo(133_630);
    expect(convert(133_630, "won", USD)).toBeCloseTo(100);
  });
  it("엔은 100 단위 고시 — 1엔당 값으로 (FX-04)", () => {
    expect(convert(1000, "foreign", JPY)).toBeCloseTo(8468.9);
    expect(convert(10_000, "won", JPY)).toBeCloseTo(1180.79, 1);
  });
  it("송금 환율 — 원 → 외화는 tts (덜 받음) · 외화 → 원은 ttb (덜 받음)", () => {
    expect(convertRemit(10_000, "won", USD)!).toBeLessThan(convert(10_000, "won", USD));
    expect(convertRemit(100, "foreign", USD)!).toBeLessThan(convert(100, "foreign", USD));
  });
  it("송금 환율이 없으면(예비 출처) null — 지어내지 않음", () => {
    expect(convertRemit(100, "won", FALLBACK)).toBeNull();
  });
  it("빠른 금액은 고시 단위에 맞춤", () => {
    expect(presets("foreign", USD)).toEqual([10, 50, 100, 500]);
    expect(presets("foreign", JPY)).toEqual([1000, 5000, 10000, 50000]);
    expect(presets("won", JPY)[0]).toBe(10_000);
  });
  it("표시: 원 · 엔은 정수 · 달러는 소수 둘째 자리", () => {
    expect(amountText(133_630.4, "won", USD)).toBe("133,630");
    expect(amountText(7.4839, "foreign", USD)).toBe("7.48");
    expect(amountText(1180.79, "foreign", JPY)).toBe("1,181");
  });
  it("입력: 쉼표 · 빈칸 허용 · 숫자 아님 · 음수 · 빈 칸은 null", () => {
    expect(parseInput("1,000")).toBe(1000);
    expect(parseInput(" 2.5 ")).toBe(2.5);
    expect(parseInput("")).toBeNull();
    expect(parseInput("-3")).toBeNull();
    expect(parseInput("abc")).toBeNull();
  });
});
