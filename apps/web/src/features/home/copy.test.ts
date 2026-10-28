import { describe, expect, it } from "vitest";
import { headline, percentileText, rateText } from "./copy";

describe("첫 화면 문장 — 예측 문구 없음 (SIG-01)", () => {
  it("신호마다 문장 · 받침에 맞춘 조사", () => {
    expect(headline("USD", "cheap")).toBe("오늘, 달러는 싼 편입니다.");
    expect(headline("JPY", "expensive")).toBe("오늘, 엔화는 비싼 편입니다.");
    expect(headline("VND", "normal")).toBe("오늘, 동은 평소 수준입니다.");
    expect(headline("USD", null)).toBe("오늘, 달러는 판단할 자료가 모자랍니다.");
  });

  it("오른다 · 내린다 같은 예측 말이 없다", () => {
    for (const s of ["cheap", "normal", "expensive", null] as const) {
      expect(headline("USD", s)).not.toMatch(/오를|내릴|오른다|내린다|전망|예상/);
    }
  });
});

describe("백분위 설명 (SIG-02)", () => {
  it("싼 편 0.02 → 98%의 날보다 낮음 · 비싼 편 0.9 → 90%의 날보다 높음", () => {
    expect(percentileText("cheap", 0.02, 90)).toBe("최근 90일 중 98%의 날보다 낮음");
    expect(percentileText("expensive", 0.9, 90)).toBe("최근 90일 중 90%의 날보다 높음");
    expect(percentileText("normal", 0.5, 90)).toBe("최근 90일 가운데쯤");
    expect(percentileText(null, null, 90)).toMatch(/모자라/);
  });

  it("맨 끝은 \"100%의 날보다\" 대신 가장 낮음 · 가장 높음 (화면에서 어색해서 바꿈)", () => {
    expect(percentileText("cheap", 0, 90)).toBe("최근 90일 중 가장 낮음");
    expect(percentileText("expensive", 1, 90)).toBe("최근 90일 중 가장 높음");
  });
});

describe("환율 표시 (FX-04)", () => {
  it("엔은 100 단위를 붙여 그대로", () => {
    expect(rateText({ baseRate: 838.3, unit: 100 })).toEqual({ value: "838.3", unit: "원 / 100" });
    expect(rateText({ baseRate: 1324.3, unit: 1 })).toEqual({ value: "1,324.3", unit: "원" });
    expect(rateText({ baseRate: 5.12, unit: 1 })).toEqual({ value: "5.12", unit: "원" });
  });
});
