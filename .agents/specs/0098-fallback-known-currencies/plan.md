# 계획

## 무엇을 · 왜
- 예비 출처(Frankfurter)가 통화를 160개 넘게 줘서, 예비로 넘어간 날은 통화 목록이 22개 → 160개로 늘어날 수 있음
  - 운영 D1 에 이미 예비 줄 326개 · 169통화 (2026-04-06 · 09-15) — 지금은 그날이 최신이 아니라 화면엔 안 보임
  - 로컬에서 예약 수집을 돌려 보다 발견 (키 없는 로컬은 예비로 감 → 82통화)
- 예비는 공식 출처(수출입은행)가 최근 30일에 준 통화만 채움 · 공식 기록이 없으면(처음 수집) 거르지 않음 (FX-09 새로)
- 이미 저장된 예전 예비 줄은 그대로 둠 (지우기는 사용자 일 · 화면에 안 나옴)

## 애매한 곳
- 기준 기간 30일 (가정)

## 파일 계획
- apps/api/src/features/fx/collect.ts
- apps/api/src/features/fx/collect.test.ts
- apps/api/src/features/fx/store.ts
- docs/domain/fx.md
- .agents/specs/0098-fallback-known-currencies/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 Worker: 공식 줄 USD · JPY 만 있을 때 예비 수집 → 2통화만 저장 · 공식 기록 없으면 82통화 (처음 수집)

## 허점
- 예비 출처를 붙일 때(작업 0004) 통화 수 차이를 생각하지 않음 — 출처를 바꾸는 길은 "같은 모양의 결과" 까지 확인
