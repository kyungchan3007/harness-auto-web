import { describe, expect, it } from "vitest";
import { DESTINATIONS, SEOUL, angleBetween, arcPoints, faceRotationY, toVec3 } from "./geo";

const len = (v: number[]) => Math.hypot(...v);

describe("위경도 → 3D 좌표", () => {
  it("북극은 위 · 남극은 아래 · 적도는 y = 0 · 모두 반지름 r", () => {
    expect(toVec3(90, 0)[1]).toBeCloseTo(1);
    expect(toVec3(-90, 0)[1]).toBeCloseTo(-1);
    expect(toVec3(0, 45)[1]).toBeCloseTo(0);
    expect(len(toVec3(SEOUL.lat, SEOUL.lng, 2))).toBeCloseTo(2);
  });

  it("서울은 북반구 (y > 0)", () => {
    expect(toVec3(SEOUL.lat, SEOUL.lng)[1]).toBeGreaterThan(0);
  });
});

describe("대권 호", () => {
  for (const d of DESTINATIONS) {
    it(`서울 → ${d.name}: 끝점은 구 표면 · 가운데는 떠 있음`, () => {
      const pts = arcPoints(SEOUL, d, { segments: 32 });
      const [first, last, mid] = [pts[0], pts.at(-1)!, pts[16]];
      expect(len(first)).toBeCloseTo(1);
      expect(len(last)).toBeCloseTo(1);
      first.forEach((v, i) => expect(v).toBeCloseTo(toVec3(SEOUL.lat, SEOUL.lng)[i]));
      last.forEach((v, i) => expect(v).toBeCloseTo(toVec3(d.lat, d.lng)[i]));
      expect(len(mid)).toBeGreaterThan(1);
    });
  }

  it("멀수록 높이 뜬다 (도쿄 < 뉴욕)", () => {
    const peak = (pts: number[][]) => Math.max(...pts.map(len));
    const tokyo = DESTINATIONS.find((d) => d.id === "tokyo")!;
    const ny = DESTINATIONS.find((d) => d.id === "newyork")!;
    expect(peak(arcPoints(SEOUL, tokyo))).toBeLessThan(peak(arcPoints(SEOUL, ny)));
  });

  it("서울 ↔ 도쿄 중심각 ≈ 1,160km / 6,371km (실제 거리와 맞음)", () => {
    const tokyo = DESTINATIONS.find((d) => d.id === "tokyo")!;
    const km = angleBetween(toVec3(SEOUL.lat, SEOUL.lng), toVec3(tokyo.lat, tokyo.lng)) * 6371;
    expect(km).toBeGreaterThan(1100);
    expect(km).toBeLessThan(1250);
  });
});

describe("처음 방향", () => {
  it("서울이 카메라(+z) 쪽을 봄: 돌린 뒤 x ≈ 0 · z > 0", () => {
    const a = faceRotationY(SEOUL);
    const [x, y, z] = toVec3(SEOUL.lat, SEOUL.lng);
    const rx = x * Math.cos(a) + z * Math.sin(a);
    const rz = -x * Math.sin(a) + z * Math.cos(a);
    expect(rx).toBeCloseTo(0);
    expect(rz).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
  });
});
