import { describe, expect, it } from "vitest";
import { BLOCK, PER_LAYER, PULL, pulled, towerLayout } from "./tower";

describe("블록 탑 배치", () => {
  it("블록 수만큼 · 한 층 3개 · 높이는 층 수만큼", () => {
    const { spots, height } = towerLayout(7);
    expect(spots).toHaveLength(7);
    expect(new Set(spots.map((s) => s.position[1])).size).toBe(Math.ceil(7 / PER_LAYER));
    expect(height).toBeCloseTo(3 * BLOCK.tall + 2 * BLOCK.gap, 6);
  });

  it("층마다 방향이 엇갈림 · 같은 층 블록은 겹치지 않음", () => {
    const { spots } = towerLayout(6);
    expect(spots.slice(0, 3).every((s) => s.rotationY === 0)).toBe(true);
    expect(spots.slice(3).every((s) => s.rotationY === Math.PI / 2)).toBe(true);
    const zs = spots.slice(0, 3).map((s) => s.position[2]);
    expect(Math.min(...zs.slice(1).map((z, i) => z - zs[i]))).toBeGreaterThanOrEqual(BLOCK.short);
  });

  it("빼낸 자리 — 블록의 긴 쪽으로만 · 높이는 그대로", () => {
    const { spots } = towerLayout(4);
    expect(pulled(spots[1])).toEqual([PULL, spots[1].position[1], spots[1].position[2]]);
    expect(pulled(spots[3])).toEqual([spots[3].position[0], spots[3].position[1], PULL]);
  });

  it("색 높이 t — 맨 아래 0 · 맨 위 1 · 하나면 1 · 0개 · 음수는 빈 탑", () => {
    const { spots } = towerLayout(4);
    expect(spots[0].t).toBe(0);
    expect(spots[3].t).toBe(1);
    expect(towerLayout(1).spots[0].t).toBe(1);
    expect(towerLayout(0)).toEqual({ spots: [], height: 0 });
    expect(towerLayout(-3)).toEqual({ spots: [], height: 0 });
  });
});
