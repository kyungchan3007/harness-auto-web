import { describe, expect, it } from "vitest";
import { bandOf, countriesOf, relativeText, TRAVEL_COUNTRIES, travelBands } from "./travel";

const row = (country: string, relative: number, year = 2025) => ({ country, year, level: relative * 0.6, relative, source: "worldbank:test" });

describe("물가 묶음", () => {
  it("경계 — 0.9 미만 싼 편 · 1.1 초과 비싼 편 · 경계 값은 비슷", () => {
    expect([0.52, 0.9, 1, 1.1, 1.116].map(bandOf)).toEqual(["cheap", "similar", "similar", "similar", "pricey"]);
  });

  it("문장 — 퍼센트 반올림 · 0 은 거의 같음", () => {
    expect(relativeText(1.616)).toBe("62% 비쌈");
    expect(relativeText(0.521)).toBe("48% 쌈");
    expect(relativeText(1.004)).toBe("거의 같음");
  });
});

describe("여행지 나라 고르기", () => {
  const levels = { base: "KOR", rows: [row("KOR", 1), row("THA", 0.521), row("USA", 1.616), row("JPN", 1.05), row("ZZZ", 0.1), row("GUM", 1.3, 2021)] };

  it("표에 있는 나라만 · 싼 나라부터 · 기준 나라(한국)는 뺌", () => {
    const { bands } = travelBands(levels);
    expect(bands.map((b) => [b.id, b.rows.map((r) => r.country)])).toEqual([
      ["cheap", ["THA"]],
      ["similar", ["JPN"]],
      ["pricey", ["GUM", "USA"]],
    ]);
  });

  it("자료가 없는 나라는 지어내지 않고 missing 으로 (TRV-02)", () => {
    const { missing, bands } = travelBands(levels);
    expect(missing).toContain("TWN");
    expect(bands.flatMap((b) => b.rows).some((r) => r.country === "TWN")).toBe(false);
  });

  it("기준 연도가 섞이면 모두 알려 줌 (TRV-03) · 최신부터", () => {
    expect(travelBands(levels).years).toEqual([2025, 2021]);
  });

  it("빈 묶음은 빠짐", () => {
    expect(travelBands({ base: "KOR", rows: [row("THA", 0.5)] }).bands.map((b) => b.id)).toEqual(["cheap"]);
  });

  it("통화 → 나라 · 유로는 여러 나라", () => {
    expect(countriesOf("JPY")).toEqual(["JPN"]);
    expect(countriesOf("EUR").length).toBeGreaterThan(5);
    expect(Object.values(TRAVEL_COUNTRIES).every((c) => /^[A-Z]{2}$/.test(c.flag))).toBe(true);
  });
});
