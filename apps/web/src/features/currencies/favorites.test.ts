import { describe, expect, it } from "vitest";
import { favoritesFirst, parseFavorites, toggleFavorite } from "./favorites";

describe("즐겨찾는 통화 (작업 0089)", () => {
  it("저장된 글 읽기 — 모양이 틀리면 빈 목록 · 이상한 값 · 중복은 버림", () => {
    expect(parseFavorites('["JPY","USD"]')).toEqual(["JPY", "USD"]);
    expect(parseFavorites('["JPY","jpy","JPY",3,"EURO"]')).toEqual(["JPY"]);
    expect(parseFavorites("{")).toEqual([]);
    expect(parseFavorites('{"a":1}')).toEqual([]);
    expect(parseFavorites(null)).toEqual([]);
  });
  it("켜고 끄기", () => {
    expect(toggleFavorite(["JPY"], "USD")).toEqual(["JPY", "USD"]);
    expect(toggleFavorite(["JPY", "USD"], "JPY")).toEqual(["USD"]);
  });
  it("최대 20개 — 넘치면 오래된 것부터 빠짐", () => {
    const many = Array.from({ length: 20 }, (_, i) => `A${String.fromCharCode(65 + i)}A`);
    expect(toggleFavorite(many, "ZZZ")).toHaveLength(20);
    expect(toggleFavorite(many, "ZZZ").at(-1)).toBe("ZZZ");
  });
  it("고른 순서대로 앞에 · 나머지는 원래 순서", () => {
    const items = ["JPY", "CNH", "USD", "EUR"].map((currency) => ({ currency }));
    expect(favoritesFirst(items, ["EUR", "JPY"]).map((i) => i.currency)).toEqual(["EUR", "JPY", "CNH", "USD"]);
    expect(favoritesFirst(items, []).map((i) => i.currency)).toEqual(["JPY", "CNH", "USD", "EUR"]);
  });
});
