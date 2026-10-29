// 홈 지구본에 그릴 곳 — 이 사이트의 데이터 (계산은 @hav/ui/three/geo)
import type { Place } from "@hav/ui/three/geo";

export const SEOUL: Place = { id: "seoul", name: "서울", lat: 37.57, lng: 126.98 };

/** 여행지 — 홈 흐름 "일본 · 미국 · 유럽 · 태국" (docs/design.md) · country = 물가 자료의 나라 코드 (ISO alpha-3) */
export const DESTINATIONS: (Place & { country: string })[] = [
  { id: "tokyo", name: "도쿄", lat: 35.68, lng: 139.69, currency: "JPY", country: "JPN" },
  { id: "newyork", name: "뉴욕", lat: 40.71, lng: -74.01, currency: "USD", country: "USA" },
  { id: "paris", name: "파리", lat: 48.86, lng: 2.35, currency: "EUR", country: "FRA" },
  { id: "bangkok", name: "방콕", lat: 13.75, lng: 100.5, currency: "THB", country: "THA" },
];
