# 계획

## 무엇을 · 왜
- 2026-10-30 복구가 끝나 작업 0080 의 남은 정리를 함
  - GitHub 예약 실행이 02:26 UTC 까지 한 번도 안 돎(지연) → 손으로 workflow_dispatch 실행 → 모든 단계 성공
  - 확인: API /fx/latest · /tasks 200 · /tasks 에 snags · 운영 D1 에 task_snags · fx_rates_currency_date · 사이트 5곳 "자료 없음" 0 · 안내 줄 0
- 한 번짜리 예약 `recover-2026-10-30.yml` 지움 (보호 파일 — 작업 0080 계획에서 끝나면 지우기로 함)
- `OUTAGE = null` (안내 줄 길은 남겨 둠 · 다음엔 값만 바꿈)

## 애매한 곳
- 없음

## 파일 계획
- .github/workflows/recover-2026-10-30.yml
- apps/web/src/shared/outage.ts
- .agents/specs/0080-outage-notice/plan.md
- .agents/specs/0082-outage-cleanup/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 운영 복구 확인 (위)

## 허점
- GitHub 예약(cron)은 이번에도 2시간 넘게 안 돎 — 시각이 중요한 일을 cron 하나에 맡기지 말 것 (다음엔 사람이 확인하거나 손으로 실행할 길을 같이 적어 둠)
- spec:new 번호가 커밋 메시지로만 쓴 0081 과 겹침 → 0082 로 바꿈
