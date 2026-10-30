import { describe, expect, it } from "vitest";
import { pctText, sortByChange } from "./sort";

const items = [
  { currency: "JPY", change: -1.9 },
  { currency: "AED", change: null },
  { currency: "USD", change: -0.5 },
  { currency: "EUR", change: 0.8 },
];

describe("통화 목록 정렬 (작업 0099)", () => {
  it("기본은 그대로", () => {
    expect(sortByChange(items, "region")).toBe(items);
  });
  it("많이 싸진 순 · 변화율 없는 통화는 뒤로", () => {
    expect(sortByChange(items, "cheaper").map((i) => i.currency)).toEqual(["JPY", "USD", "EUR", "AED"]);
  });
  it("많이 비싸진 순 · 변화율 없는 통화는 뒤로", () => {
    expect(sortByChange(items, "pricier").map((i) => i.currency)).toEqual(["EUR", "USD", "JPY", "AED"]);
  });
  it("글자", () => {
    expect(pctText(-1.94)).toBe("-1.9%");
    expect(pctText(0.8)).toBe("+0.8%");
  });
});
