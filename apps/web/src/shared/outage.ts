// 장애 안내 값 — 서버(layout: 빌드 때 넣을지) · 브라우저(안내 줄: 시각이 지나면 숨김)가 같이 씀
//   "use client" 파일에서 내보낸 함수는 서버에서 부를 수 없어 따로 둠 (작업 0081)
//   다음 장애 때 다시 쓰려면 값만 바꿈 · 끝나면 null
export const OUTAGE: { until: string; text: string } | null = {
  until: "2026-10-30T00:00:00Z", // 한국 10월 30일(금) 09:00 — D1 한도가 다시 차는 때 (00:00 UTC)
  text: "데이터베이스 하루 사용 한도를 넘겨 지금은 환율 · 물가 · 작업 기록을 불러오지 못합니다. 한국 시간 10월 30일(금) 오전 9시부터 다시 정상으로 돌아옵니다.",
};

export const outageActive = (now = Date.now()) => OUTAGE !== null && now < Date.parse(OUTAGE.until);
