// 장애 안내 값 — 서버(layout: 빌드 때 넣을지) · 브라우저(안내 줄: 시각이 지나면 숨김)가 같이 씀
//   "use client" 파일에서 내보낸 함수는 서버에서 부를 수 없어 따로 둠 (작업 0081)
//   다음 장애 때 다시 쓰려면 값만 바꿈 · 끝나면 null
type Outage = { until: string; text: string };
// null 을 바로 넣으면 TS 가 타입을 never 로 좁혀 outageActive 가 깨짐 → as 로 넓혀 둠
export const OUTAGE = null as Outage | null;

export const outageActive = (now = Date.now()) => OUTAGE !== null && now < Date.parse(OUTAGE.until);
