# 계획

## 무엇을 · 왜
- 모든 페이지(만드는 중 /log 포함) 맨 위에 장애 안내 줄 — D1 하루 읽기 한도 초과로 자료를 못 불러옴 · 한국 10월 30일(금) 09:00 부터 정상
  - 빌드 때 이미 끝난 시각이면 HTML 에 안 넣음 · 연 채로 시각이 지나면 브라우저가 숨김 (`apps/web/src/shared/outage-notice.tsx`)
- 지금은 운영 빌드가 멈추므로(작업 0078 · API 500) 이번 한 번은 로컬 빌드를 `wrangler pages deploy` 로 운영에 직접 올림
- 내일 복구: GitHub Actions 한 번짜리 예약 `recover-2026-10-30.yml` (컴퓨터가 꺼져도 GitHub 에서 돎)
  - API 가 200 이 될 때까지 기다림 → deploy-api 실행(마이그레이션 0004 · 0005 · 새 코드) → rebuild-site 실행 → 사이트에 "자료 없음" 이 없는지
  - 00:10 · 00:40 · 01:20 · 02:15 UTC — GitHub 예약은 몇 시간 늦을 수 있음 · 이미 정상이면 건너뜀 · 2026-10-30 이 아니면 건너뜀
- 워크플로는 보호 파일 — 사용자가 예약을 직접 요청 (위 원문)

## 애매한 곳
- 안내 문구 · 위치: 메뉴 위 한 줄 · 신호 "비쌈" 색 테두리 (가정)

## 파일 계획
- apps/web/src/shared/outage-notice.tsx
- apps/web/src/shared/outage.ts
- apps/web/src/app/layout.tsx
- .github/workflows/recover-2026-10-30.yml
- .agents/specs/0080-outage-notice/**

## 계획 밖 변경 이유

## 완료 기준
- [x] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 운영에 안내 줄 (직접 배포)
- [x] 2026-10-30 예약 실행이 API · 사이트를 되살림 → 이 워크플로 지우기 · OUTAGE = null (작업 0082 · 예약이 늦어 손으로 실행)

## 허점
- (작업 0081) "use client" 파일에서 내보낸 함수(outageActive)를 서버 layout 에서 불러 빌드가 깨진 채 머지함 — 게이트(Quick)는 빌드를 안 돌려 못 잡음 → layout · 서버 경계를 바꾸면 머지 전에 `npx turbo run build --filter=@hav/web` 를 돌릴 것
- 장애 안내를 띄우는 길이 미리 없어서 그때 만듦 — OUTAGE 를 남겨 두고 다음엔 값만 바꿈
