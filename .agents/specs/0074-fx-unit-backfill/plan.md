# 계획

## 무엇을 · 왜
- 예비 출처(Frankfurter)가 1 단위로 저장한 엔 · 루피아 예전 줄을 100 단위로 (작업 0072 의 남은 일 · FX-04)
- 보호 파일(apps/api/drizzle/migrations/**) 새 파일 — 사용자 승인 "둘 다 승인" (위 원문) · 이미 만든 마이그레이션은 고치지 않음

## 애매한 곳
- 운영 DB 확인(2026-10-29 읽기만): 엔 2줄 · 루피아 2줄 (2026-04-06 · 2026-09-15)
- 값: base_rate × 100 을 소수 4자리로 반올림 — 원래 응답(rate)에서 다시 계산한 값과 소수 넷째 자리에서 조금 다를 수 있음 (가정 · 1 단위 값은 같음)
- 화면 `toUnit` 은 남겨 둠 — 해도 되는 일이 없어지지만 다른 출처가 단위를 다르게 줄 때를 막아 줌 (가정)

## 파일 계획
- apps/api/drizzle/migrations/0003_fx_unit_backfill.sql
- apps/api/drizzle/migrations/meta/_journal.json
- apps/api/drizzle/migrations/meta/0003_snapshot.json
- docs/domain/fx.md
- .agents/specs/0074-fx-unit-backfill/**

## 계획 밖 변경 이유

## 완료 기준
- [x] 로컬 D1 에 시험 줄을 넣고 같은 SQL 로 엔만 100 단위 · 달러는 그대로 확인 뒤 지움
- [x] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [ ] 배포(deploy-api 의 migrations apply) 뒤 운영 DB 에 1 단위 엔 · 루피아 줄 0

## 허점
-
