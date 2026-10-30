# 계획

## 무엇을 · 왜
- 여행 예산 어림(작업 0088)으로 가는 길 — 페이지 맨 아래라 찾기 어려움
  - 홈 여행지 칸: "일본 여행 예산 어림 →" (물가 자료가 있을 때만)
  - 통화 상세: 그 통화를 쓰는 나라가 하나면 "일본 여행 예산 어림 →" (달러처럼 여러 나라면 "물가 보기" 그대로)
  - `/prices?country=JPN#budget` — 계산기가 주소의 나라를 먼저 고름 · 칸으로 바로 내려감 (위 막대에 안 가리게 scroll-mt)

## 애매한 곳
- 없음

## 파일 계획
- apps/web/src/features/travel-price/budget-planner.tsx
- apps/web/src/features/home/trip-scenes.tsx
- apps/web/src/features/currencies/currency-detail.tsx
- .agents/specs/0100-budget-links/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드: ?country=THA → 태국이 골라짐 · 칸이 화면 위 80px · 홈 링크 4개 · 엔화 상세 링크 · 페이지 오류 0

## 허점
- 없음
