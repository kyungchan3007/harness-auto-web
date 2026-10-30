// 지구본 계산 — 위경도 → 3D 좌표 · 대권(가장 짧은 길) 호 · 처음에 어떤 곳이 앞을 보게 돌리는 각도 (three 없이 순수 함수)
// 어느 나라 · 도시를 그릴지는 쓰는 쪽(앱)이 정함

export type Vec3 = [number, number, number];

export type Place = { id: string; name: string; lat: number; lng: number; currency?: string };

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

/** 두 곳의 대권 가운데 (위경도) — 지구본이 출발지 · 도착지 호가 다 보이게 이곳을 앞에 둠 · 정반대 두 점은 a 를 돌려줌 */
export function midpoint(a: Pick<Place, "lat" | "lng">, b: Pick<Place, "lat" | "lng">): { lat: number; lng: number } {
  const va = toVec3(a.lat, a.lng);
  const vb = toVec3(b.lat, b.lng);
  const sum: Vec3 = [va[0] + vb[0], va[1] + vb[1], va[2] + vb[2]];
  const l = len(sum);
  if (l < 1e-9) return { lat: a.lat, lng: a.lng };
  const m = scale(sum, 1 / l);
  // toVec3 의 반대 계산
  const lat = 90 - Math.acos(m[1]) / RAD;
  const lng = Math.atan2(m[2], -m[0]) / RAD - 180;
  return { lat, lng: ((lng + 540) % 360) - 180 };
}

/** 처음 화면에서 이 장소가 카메라(+z) 쪽을 보게 하는 y 축 회전 각 */
export function faceRotationY(place: Pick<Place, "lat" | "lng">): number {
  const [x, , z] = toVec3(place.lat, place.lng);
  return -Math.atan2(x, z);
}

/** 카메라 기본 거리 · 지구 + 테두리 빛 + 호가 들어가야 할 반지름 */
export const GLOBE_CAMERA_Z = 4.2;
export const GLOBE_FIT_RADIUS = 1.3;

/** 세로로 긴 칸에서도 지구가 양옆으로 잘리지 않게 카메라를 물림 — fov 는 세로 기준이라 칸이 좁으면 가로 시야가 줄어듦 (작업 0085)
 *  넓은 칸은 지금 거리(GLOBE_CAMERA_Z) 그대로 · 좁아질 때만 멀리 */
export function fitDistance(fovDeg: number, aspect: number, radius = GLOBE_FIT_RADIUS, min = GLOBE_CAMERA_Z) {
  const v = (fovDeg * Math.PI) / 360;
  const h = Math.atan(Math.tan(v) * aspect);
  return Math.max(min, radius / Math.sin(Math.min(v, h)));
}
