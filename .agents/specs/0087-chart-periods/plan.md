# 계획

## 무엇을 · 왜
- 통화 상세 흐름 그래프에 기간 단추 1개월 · 3개월 · 6개월 · 1년 — 이슈 #5 가 "30일 · 1년 추이" 를 요구했는데 1년만 있었음
  - 빌드 때 받은 1년치를 화면에서 자르기만 함 (API 를 더 부르지 않음 · D1 읽기 그대로)
  - 그 기간 처음 → 마지막 변화율 "-7.8% · 3개월 전보다 외화가 싸졌습니다" (지난 값만 · 예측 아님 SIG-01)
- 이슈 #5 · #6 은 기능이 다 들어갔지만 닫기는 자동 모드가 막음 (직접 · PR 의 Closes 둘 다) → 사용자에게 알림

## 애매한 곳
- 기본 기간: 1년 (가정 · 예전 화면과 같게)

## 파일 계획
- apps/web/src/features/currencies/periods.ts
- apps/web/src/features/currencies/periods.test.ts
- apps/web/src/features/currencies/period-chart.tsx
- apps/web/src/features/currencies/currency-detail.tsx
- apps/web/src/shared/year-chart.tsx
- .agents/specs/0087-chart-periods/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면 1280 · 375: 1개월 21일 -1.7% · 3개월 61일 -7.8% · 1년 245일 -6.7% · 가로 넘침 0

## 허점
- 없는 색 이름(text-bg)을 썼다가 화면에서 보고 text-surface 로 — 토큰은 tokens.css @theme 에 있는 것만
