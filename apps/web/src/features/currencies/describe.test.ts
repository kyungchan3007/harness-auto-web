import { describe, expect, it } from "vitest";
import { describeCurrency } from "./describe";

describe("통화 페이지 설명 글 (작업 0093)", () => {
  it("기준일 · 값 · 신호를 같이", () => {
    expect(describeCurrency("USD", { date: "2026-10-29", baseRate: 1336.3, unit: 1 }, "cheap")).toBe(
      "달러(USD) 2026-10-29 기준 1,336.3원 · 최근 90일 중 싼 편 (예측 아님) · 원 ↔ USD 환율 계산기 · 1개월 ~ 1년 흐름",
    );
  });
  it("엔은 100 단위로 · 신호가 없으면 뺌", () => {
    expect(describeCurrency("JPY", { date: "2026-10-29", baseRate: 846.89, unit: 100 }, null)).toContain("846.89원 / 100 · 원 ↔ JPY");
  });
  it("환율이 없으면 숫자를 지어내지 않음", () => {
    expect(describeCurrency("USD", null, null)).not.toMatch(/기준|[\d,.]+원/);
  });
});
