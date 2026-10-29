# 계획

## 무엇을 · 왜
- 예비 출처(Frankfurter)도 수출입은행과 같은 고시 단위로 저장 — 엔 · 루피아 100 (FX-04)
- 지금은 1 단위로 저장돼 화면이 `toUnit` 으로 맞춰 그림 (작업 0058) · 신호 계산은 이미 1 단위 값으로 나눠 써서 섞여도 안전

## 애매한 곳
- 이미 저장된 예전 줄(1 단위)은 고치지 않음 — 고치려면 새 D1 마이그레이션이 필요하고 `apps/api/drizzle/migrations/**` 는 보호 파일(사람 승인) → 이번엔 앞으로 저장하는 값만 · 화면 `toUnit` 은 그대로 둠 (가정)

## 파일 계획
- apps/api/src/features/fx/frankfurter.ts
- apps/api/src/features/fx/sources.test.ts
- docs/domain/fx.md
- .agents/specs/0072-fx-unit/**

## 계획 밖 변경 이유

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [ ] 배포 뒤 API 가 그대로 동작 (/fx/latest · /signal)

## 허점
- 예전 줄 정리는 보호 파일(마이그레이션) 승인이 있어야 함 → 사용자에게 알림
