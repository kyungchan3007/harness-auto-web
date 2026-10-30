# SDD — 어떻게

> 요구사항: [prd.md](prd.md)

## 접근
- 계약 `@hav/shared/status` SiteStatus (RunReason · StatusRun · StatusSlot)
- API `features/status/status.ts` (순수: reasonOf · scheduleOf · siteStatus) · `routes.ts` (D1 세 쿼리: fetch_runs 최근 20 · 최신 날짜 1 · 오늘 첫 저장 시각) · cached({ bucketMs: 5분 })
  - 회차 상태: 회차 시각부터 20분 안 수집 기록 → 그 결과 · 다시 하는 회차인데 그 전에 오늘 값이 있으면 not-needed · 5분 지나도 없으면 missed
  - 회차 목록은 index.ts CRON 과 같게 (테스트로 묶음)
- 캐시 `cached()` 에 bucketMs 선택 — 키에 구간(YYYY-MM-DDTHH:MM) · 새 환율 저장 때 비움은 그대로
- 화면 `features/log/status-board.tsx` (빌드 값 먼저 · /bff/status 5분마다 · document.hidden 이면 안 받음) · `status-text.ts` (순수 글)
- BFF `/status` 60초 · 이름 바꿈: site-nav · live-panel · log page metadata(title 없음 → 레이아웃의 "Tripfx")

## 대안 · 트레이드오프
- 캐시 없이 매번 계산 → 요청당 ~45줄 · 화면 100개가 1분마다면 하루 수백만 줄 (D1 한도 500만) — 뺌
- 쉬는 동안만 점검판으로 바꿔 끼우기 → 사용자가 "위에 섹션 추가" 를 고름

## 파일 계획
- packages/shared/src/status.ts
- packages/shared/package.json
- apps/api/src/features/status/**
- apps/api/src/db/cache.ts
- apps/api/src/db/cache.test.ts
- apps/api/src/index.ts
- apps/web/src/features/log/**
- apps/web/src/app/log/page.tsx
- apps/web/src/app/design/characters.tsx
- apps/web/src/shared/api.ts
- apps/web/src/shared/site-nav.tsx
- apps/web/src/bff/proxy.ts
- apps/web/e2e/features.spec.ts
- docs/design.md
- docs/domain/build-log.md
- .agents/specs/0105-site-status/**

## 계획 밖 변경 이유

## 위험
- 화면 PR 과 API 를 한 번에 머지 → Pages 빌드가 API 배포보다 먼저면 점검판이 "상태를 받지 못했습니다" → 브라우저가 /bff/status 로 다시 받아 채움 (멈추지 않음)
- 15:00 예약 직전 배포 금지 — 15:05 뒤에 머지 (작업 0097 지킴이도 있음)

## 검증 계획
- API 테스트 (10-30 실제 회차 상황 · 이유 분류 · 계약 · 구간 캐시) · 화면 글 테스트
- 로컬 Worker /status · 로컬 빌드 화면 1280 · 375 · e2e
- 배포 뒤 운영 /bff/status · 화면

## 계획과 달라진 점
- 처음엔 /status 를 캐시하지 않으려 했으나 사용자 지적(D1 사용량)대로 5분 구간 캐시
