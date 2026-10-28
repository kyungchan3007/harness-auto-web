import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, readSurfaces } from "./contrast";

const surfaces = readSurfaces(readFileSync(new URL("./tokens.css", import.meta.url), "utf8"));

// 본문으로 쓰는 색은 4.5, 큰 글자(오로라 그라데이션)는 3 — WCAG AA
const BODY = ["fg", "fg-2", "accent", "cheap", "normal", "expensive"];
const LARGE = ["aurora-1", "aurora-2", "aurora-3"];

describe("contrastRatio", () => {
  it("검정 · 흰색은 21, 같은 색은 1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#4ff0e0", "#4ff0e0")).toBe(1);
  });
  it("#rrggbb 가 아니면 오류", () => {
    expect(() => contrastRatio("red", "#000000")).toThrow();
  });
});

describe("tokens.css 대비", () => {
  it("dark · elevated · light 세 배경이 모두 있다", () => {
    expect(Object.keys(surfaces).sort()).toEqual(["dark", "elevated", "light"]);
  });

  for (const [name, v] of Object.entries(surfaces)) {
    for (const bg of ["surface", "surface-2"]) {
      for (const fg of BODY) {
        it(`${name}: ${fg} on ${bg} ≥ 4.5`, () => {
          expect(contrastRatio(v[fg], v[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
      for (const fg of LARGE) {
        it(`${name}: ${fg} on ${bg} ≥ 3 (큰 글자)`, () => {
          expect(contrastRatio(v[fg], v[bg])).toBeGreaterThanOrEqual(3);
        });
      }
    }
    it(`${name}: on-accent on accent ≥ 4.5 (버튼 글자)`, () => {
      expect(contrastRatio(v["on-accent"], v.accent)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
