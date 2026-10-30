# 계획

## 무엇을 · 왜
- 2026-10-30(금) 12:00 KST 환율 예약 수집이 아예 돌지 않음 — fetch_runs 에 그날 기록 없음 · /fx/latest 가 10-29 그대로 (13:00 KST 에 발견)
  - 예약(cron)은 등록돼 있음 (배포 기록 "schedule: 0 3 * * 1-5")
  - 02:56 UTC 에 Worker 배포 — 배포마다 예약을 다시 걸고, 바뀜이 퍼지는 데 시간이 걸려 03:00 을 놓친 것으로 봄 (가정 · 지난 기록을 볼 명령이 없음)
  - 오늘 머지마다 화면만 바뀌어도 API 를 다시 배포했음
- 고침 세 가지
  1. 놓친 날 다시: 13:30 · 15:00 KST 예약 — 오늘 값이 있으면 D1 한 줄만 읽고 끝 (FX-07 새로)
  2. 새 값을 저장하면 Worker 가 Pages 배포 훅을 바로 부름 — GitHub 예약(rebuild-site)은 어제 · 오늘 몇 시간씩 늦었음 → 예비로만
     - 훅 주소는 비밀값 — deploy-api 가 GitHub Secrets 의 PAGES_DEPLOY_HOOK 을 Worker 에 넣음 (없을 때만 · 값은 로그에 안 나옴)
  3. deploy-api: apps/api · packages/shared · package-lock.json 이 안 바뀐 머지는 배포 건너뜀 (손으로 실행하면 항상 배포)
- 보호 파일: wrangler.jsonc(crons) · deploy-api.yml — 사용자 지시 "알아서 진행 · 라벨도 니가" (2026-10-29 · 10-30)

## 애매한 곳
- 다시 하는 시각 13:30 · 15:00 KST (가정 · 수출입은행은 11시 전후 고시)

## 파일 계획
- apps/api/src/features/fx/daily.ts
- apps/api/src/features/fx/daily.test.ts
- apps/api/src/features/fx/store.ts
- apps/api/src/index.ts
- apps/api/src/env.ts
- apps/api/wrangler.jsonc
- .github/workflows/deploy-api.yml
- docs/domain/fx.md
- .agents/specs/0094-collect-retry/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [ ] 운영: 배포 기록에 예약 4개 · 오늘(10-30) 환율이 다시 하는 예약으로 들어오고 사이트가 다시 빌드됨

## 허점
- 예약 수집이 안 돈 것을 사용자 · 사이트가 알려 주지 않았음 — 13:00 에 다른 일을 하다 우연히 발견 · 다시 하는 예약 + "오늘 값 있는지" 검사로 스스로 메움
- 화면만 바뀐 머지에도 API 를 배포해 예약이 흔들림 — 배포는 바뀐 쪽만
