import { describe, expect, it } from "vitest";
import { GLOBE_CAMERA_Z, GLOBE_FIT_RADIUS, type Place, angleBetween, arcPoints, faceRotationY, fitDistance, midpoint, toVec3 } from "./geo";

// 홈이 실제로 쓰는 곳과 같은 값 (apps/web/src/features/home/places.ts)
const SEOUL: Place = { id: "seoul", name: "서울", lat: 37.57, lng: 126.98 };
const DESTINATIONS: Place[] = [
  { id: "tokyo", name: "도쿄", lat: 35.68, lng: 139.69, currency: "JPY" },
  { id: "newyork", name: "뉴욕", lat: 40.71, lng: -74.01, currency: "USD" },
  { id: "paris", name: "파리", lat: 48.86, lng: 2.35, currency: "EUR" },
  { id: "bangkok", name: "방콕", lat: 13.75, lng: 100.5, currency: "THB" },
];

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

describe("두 곳의 가운데", () => {
  it("적도 위 두 점 → 경도 가운데 · 날짜 변경선을 넘어도", () => {
    const m = midpoint({ lat: 0, lng: 10 }, { lat: 0, lng: 50 });
    expect(m.lat).toBeCloseTo(0, 6);
    expect(m.lng).toBeCloseTo(30, 6);
    expect(Math.abs(midpoint({ lat: 0, lng: 170 }, { lat: 0, lng: -170 }).lng)).toBeCloseTo(180, 6); // 180 = -180
  });

  it("가운데는 두 곳에서 같은 거리 · 같은 위경도면 그 자리", () => {
    const seoul = { lat: 37.57, lng: 126.98 };
    const ny = { lat: 40.71, lng: -74.01 };
    const m = midpoint(seoul, ny);
    const v = toVec3(m.lat, m.lng);
    expect(angleBetween(v, toVec3(seoul.lat, seoul.lng))).toBeCloseTo(angleBetween(v, toVec3(ny.lat, ny.lng)), 6);
    expect(midpoint(seoul, seoul).lat).toBeCloseTo(seoul.lat, 6);
    expect(midpoint(seoul, seoul).lng).toBeCloseTo(seoul.lng, 6);
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

describe("fitDistance — 지구가 칸 안에 다 들어오는 카메라 거리 (작업 0085)", () => {
  const fits = (fov: number, aspect: number) => {
    const d = fitDistance(fov, aspect);
    const v = (fov * Math.PI) / 360;
    const h = Math.atan(Math.tan(v) * aspect);
    return Math.asin(GLOBE_FIT_RADIUS / d) <= Math.min(v, h) + 1e-9;
  };
  it("넓은 칸은 기본 거리 그대로", () => {
    expect(fitDistance(42, 1.6)).toBe(GLOBE_CAMERA_Z);
  });
  it("좁은(세로로 긴) 칸은 멀리 물려서 양옆이 안 잘림", () => {
    expect(fitDistance(42, 0.6)).toBeGreaterThan(GLOBE_CAMERA_Z);
    for (const a of [0.3, 0.5, 0.6, 0.8, 1, 1.6, 2.5]) expect(fits(42, a), String(a)).toBe(true);
  });
});
