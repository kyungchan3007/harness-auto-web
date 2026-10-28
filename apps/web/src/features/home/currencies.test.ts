import { describe, expect, it } from "vitest";
import { CURRENCIES, currencyFlag, groupByRegion } from "./currencies";

// 배포한 API 가 2026-10-28 에 준 22개
const LIVE = ["AED", "AUD", "BHD", "BND", "CAD", "CHF", "CNH", "DKK", "EUR", "GBP", "HKD", "IDR", "JPY", "KWD", "MYR", "NOK", "NZD", "SAR", "SEK", "SGD", "THB", "USD"].map((currency) => ({ currency }));

describe("지역별 그룹", () => {
  it("받은 22개가 모두 정확히 한 그룹에 · 기타 없음", () => {
    const groups = groupByRegion(LIVE);
    expect(groups.flatMap((g) => g.items).length).toBe(22);
    expect(groups.map((g) => g.region)).toEqual(["asia", "americas", "europe", "mideast", "oceania"]);
    expect(LIVE.every((c) => CURRENCIES[c.currency])).toBe(true);
  });

  it("표에 없는 통화는 버리지 않고 기타로 (FX-03)", () => {
    const groups = groupByRegion([...LIVE, { currency: "XYZ" }]);
    expect(groups.at(-1)).toMatchObject({ region: "other", label: "기타", items: [{ currency: "XYZ" }] });
  });

  it("지역 안에서는 많이 쓰는 통화부터 (알파벳순 아님) — 아시아는 엔 → 위안 · 유럽은 유로 → 파운드", () => {
    const groups = groupByRegion(LIVE);
    expect(groups[0].items.slice(0, 2).map((i) => i.currency)).toEqual(["JPY", "CNH"]);
    expect(groups.find((g) => g.region === "europe")!.items.slice(0, 2).map((i) => i.currency)).toEqual(["EUR", "GBP"]);
  });

  it("빈 지역은 탭이 없음", () => {
    expect(groupByRegion([{ currency: "USD" }]).map((g) => g.region)).toEqual(["americas"]);
  });
});

describe("국기", () => {
  it("유로는 EU · 모르는 통화는 국기 없음", () => {
    expect(currencyFlag("EUR")).toBe("EU");
    expect(currencyFlag("XYZ")).toBeNull();
  });
});
