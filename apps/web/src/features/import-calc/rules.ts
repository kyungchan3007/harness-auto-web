// 직구 세금 기준값 — 이 파일 한 곳에만 (IMP-03) · 값을 바꿀 때는 출처를 다시 열어 보고 확인한 날도 같이 바꾼다
// 출처 글 (2026-10-29 열어 봄):
//   목록통관 — 물품가격 미화 150달러 이하 (미국은 200달러 이하)
//   수입신고(일반통관) — 물품가격 미화 150달러 이하 면세
//   물품가격 = 물품대금 + 발송국 안의 세금 · 내륙운임 · 보험료 · 국제운송비는 명백히 구분되면 뺄 수 있음
//   150달러 초과(수입신고)는 공제 없이 총과세가격(물품가격 + 운임 + 보험료 등)에 과세
//   부가세 = (과세가격 + 관세 + 개별소비세 + 교육세 + 주세 + 농특세) × 1/10
//   관세율은 품목 분류에 따라 다름 (값 없음 → 사용자가 넣음)

export const RULES_SOURCE = {
  name: "관세청 해외직구물품 예상세액 조회",
  url: "https://www.customs.go.kr/kcs/ad/tax/BuyTaxCalculation.do",
  checked: "2026-10-29",
} as const;

export type Route = "us-list" | "other";

/** 면세 한도 (미화 달러) */
export const DUTY_FREE_USD: Record<Route, number> = { "us-list": 200, other: 150 };

export const ROUTE_LABEL: Record<Route, string> = {
  "us-list": "미국에서 · 목록통관 물품",
  other: "그 밖 나라 · 또는 일반통관 물품",
};

export const VAT_RATE = 0.1;
