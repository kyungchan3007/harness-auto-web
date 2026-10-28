// 지구본 계산 — 위경도 → 3D 좌표 · 대권(가장 짧은 길) 호 · 처음에 한국이 앞을 보게 돌리는 각도 (three 없이 순수 함수)

export type Vec3 = [number, number, number];

export type Place = { id: string; name: string; lat: number; lng: number; currency?: string };

export const SEOUL: Place = { id: "seoul", name: "서울", lat: 37.57, lng: 126.98 };

/** 여행지 — 홈 흐름 "일본 · 미국 · 유럽 · 태국" (docs/design.md) */
export const DESTINATIONS: Place[] = [
  { id: "tokyo", name: "도쿄", lat: 35.68, lng: 139.69, currency: "JPY" },
  { id: "newyork", name: "뉴욕", lat: 40.71, lng: -74.01, currency: "USD" },
  { id: "paris", name: "파리", lat: 48.86, lng: 2.35, currency: "EUR" },
  { id: "bangkok", name: "방콕", lat: 13.75, lng: 100.5, currency: "THB" },
];

const RAD = Math.PI / 180;

/** 위경도(도) → 반지름 r 구 위의 점 · y 가 북극 */
export function toVec3(lat: number, lng: number, r = 1): Vec3 {
  const phi = (90 - lat) * RAD;
  const theta = (lng + 180) * RAD;
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

const len = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const scale = (v: Vec3, s: number): Vec3 => [v[0] * s, v[1] * s, v[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** 두 점 사이 중심각 (라디안) */
export function angleBetween(a: Vec3, b: Vec3): number {
  return Math.acos(Math.min(1, Math.max(-1, dot(a, b) / (len(a) * len(b)))));
}

/**
 * 대권 호 — 구 위 두 점을 가장 짧은 길로 잇고 가운데를 띄운다 (멀수록 높게)
 * 끝점은 구 표면 · 가운데 높이 = r × (1 + lift × 거리비)
 */
export function arcPoints(from: Place, to: Place, opts: { r?: number; segments?: number; lift?: number } = {}): Vec3[] {
  const { r = 1, segments = 64, lift = 0.35 } = opts;
  const a = toVec3(from.lat, from.lng, 1);
  const b = toVec3(to.lat, to.lng, 1);
  const omega = angleBetween(a, b);
  const height = lift * (omega / Math.PI);
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // 구면 선형 보간 (slerp) — 단위 구 위를 따라감
    const s = Math.sin(omega) || 1;
    const k1 = omega === 0 ? 1 - t : Math.sin((1 - t) * omega) / s;
    const k2 = omega === 0 ? t : Math.sin(t * omega) / s;
    const p: Vec3 = [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    pts.push(scale(p, r * (1 + height * Math.sin(Math.PI * t))));
  }
  return pts;
}

/** 처음 화면에서 이 장소가 카메라(+z) 쪽을 보게 하는 y 축 회전 각 */
export function faceRotationY(place: Pick<Place, "lat" | "lng">): number {
  const [x, , z] = toVec3(place.lat, place.lng);
  return -Math.atan2(x, z);
}
