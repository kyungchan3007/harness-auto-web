# 계획

## 무엇을 · 왜
- 여행 물가 페이지에 "여행 예산 어림" — 나라 · 한국에서 하루 쓰는 돈 · 일수 → 같은 생활이면 그 나라 하루 · 전체 (원 · 현지 통화)
  - 지금 페이지는 "12% 비쌈" 같은 비율만 — 여행자가 바로 쓰는 건 "그래서 얼마"
  - 물가 수준(세계은행 · 한국 = 1)을 곱하기만 · 현지 통화는 /signal 의 오늘 값(1 외화당 원)으로 나눔 — 새 API 호출 없음
  - 하루 값을 천 원 단위로 먼저 반올림해 "하루 × 일수 = 전체" 가 맞게
  - 어림값 · 나라 평균 안내 · 환율이 없으면 원으로만 (TRV-04 새로)

## 애매한 곳
- 기본값: 일본 · 하루 10만 원 · 4일 (가정)

## 파일 계획
- apps/web/src/features/travel-price/budget.ts
- apps/web/src/features/travel-price/budget.test.ts
- apps/web/src/features/travel-price/budget-planner.tsx
- apps/web/src/features/travel-price/price-page.tsx
- docs/domain/travel-price.md
- .agents/specs/0088-travel-budget/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면 1280 · 375: 일본 하루 약 112,000원 ≈ 13,225 JPY · 4일 448,000원 · 태국 52,000원 ≈ 1,312 THB · 가로 넘침 0

## 허점
- 처음엔 하루 · 전체를 따로 반올림해 112,000 × 4 ≠ 446,000 으로 보임 — 화면 숫자끼리 맞는지도 봐야 함
