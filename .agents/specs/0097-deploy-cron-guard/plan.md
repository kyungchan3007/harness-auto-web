# 계획

## 무엇을 · 왜
- API 배포가 예약(cron) 직전이면 기다렸다 배포 — 같은 허점 두 번째라 하네스로 막음
  - 0094: 02:56 UTC 배포 → 03:00 환율 수집이 돌지 않음
  - 0096: 04:19 UTC 배포 → 04:30 다시 수집 11분 전 (같은 위험)
- `apps/api/scripts/cron-window.mjs` — wrangler.jsonc 의 crons 를 읽어 16분 안에 도는 예약이 있으면 그 시각 + 2분까지 남은 초
- deploy-api: 마이그레이션 · 배포 전에 그만큼 sleep (최대 18분 정도)
- 보호 파일 deploy-api.yml — 사용자 지시 "알아서 진행 · 라벨도 니가"

## 애매한 곳
- 16분: Cloudflare 예약 바뀜이 퍼지는 데 걸리는 시간 (최대 15분 안팎이라고 봄 · 가정)

## 파일 계획
- apps/api/scripts/cron-window.mjs
- apps/api/src/cron-window.test.ts
- .github/workflows/deploy-api.yml
- .agents/specs/0097-deploy-cron-guard/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 테스트: 02:56 → 03:02 까지 · 04:19 → 04:32 까지 · 예약과 멀면 0 · 주말 0 · wrangler.jsonc crons 그대로

## 허점
- 0094 에 "수집 예약 앞에는 API 를 머지하지 말 것" 이라고만 적고 바로 같은 일을 함 (0096) — 사람 기억에 맡긴 규칙은 지켜지지 않음 · 검사로
