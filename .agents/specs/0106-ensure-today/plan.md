# 계획

## 무엇을 · 왜
- 2026-10-30 Worker 예약 12:00 · 13:30 · 15:00 이 모두 돌지 않음
  - 15:00 전후(14:57 ~ 15:04) wrangler tail 에 예약 이벤트 없음 · 직전 API 배포는 70분 전 → 작업 0094 의 "배포 직후라 놓침" 가정은 틀림
  - 원인은 Cloudflare 대시보드(Cron 이벤트)에서만 볼 수 있음 — 로그인이 필요해 사용자에게 알림
- 예약에 기대지 않는 길: `POST /fx/ensure-today` — 오늘 값이 없으면 수집 (다시 하는 예약과 같은 dailyFx)
  - 누구나 부를 수 있어서: 평일 · 한국 11:30 뒤 · 마지막 수집 시작 20분 안이면 안 함 · 결과에 출처 메시지 없음 · 토큰 없음
  - 새 값을 저장하면 사이트 다시 빌드 (작업 0094 훅)
- `ensure-fx.yml`: GitHub Actions 30분마다 (한국 12:10 ~ 17:40) 부르기만 · 보호 파일 — 사용자 지시 "알아서 진행 · 라벨도 니가"

## 애매한 곳
- 20분 간격 · 11:30 (가정 · 수출입은행 고시 11시 전후)

## 파일 계획
- apps/api/src/features/fx/ensure.ts
- apps/api/src/features/fx/ensure.test.ts
- apps/api/src/features/fx/routes.ts
- apps/api/src/features/fx/store.ts
- .github/workflows/ensure-fx.yml
- docs/domain/fx.md
- .agents/specs/0106-ensure-today/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [ ] 배포 뒤 한 번 불러 오늘(10-30) 환율이 들어오고 사이트가 다시 빌드됨

## 허점
- 작업 0094 에서 "배포 직후 놓침" 을 확인 없이 원인으로 잡고 고침을 쌓음 — 13:30 이 또 안 돌았을 때 바로 실시간 기록으로 확인했어야 함 · 원인 가정은 다음 회차 기록으로 바로 검증
