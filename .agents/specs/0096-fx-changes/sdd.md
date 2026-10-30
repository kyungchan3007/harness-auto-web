# SDD — 어떻게

> 요구사항: [prd.md](prd.md)

## 접근
- 계약: `@hav/shared/fx` FxChangesQuery(days 7 ~ 400 · 기본 30) · FxChanges
- API: `features/fx/changes.ts` changesOf (순수) · store `ratesSince` (기본 키 앞부분 날짜로 그 기간만) · 라우트 `/fx/changes` + cached()
- 화면: `api.changes(30)` · 홈 통화 칸에 변화율 · 칸 전체를 상세 링크로
- PR 두 개: ① API (배포 먼저) ② 화면 — 한 번에 머지하면 Pages 빌드가 API 배포보다 먼저 돌아 새 경로가 없을 수 있음

## 대안 · 트레이드오프
- 홈 빌드에서 통화마다 history 22번 → 요청 · D1 읽기가 많아 뺌
- /signal 응답에 변화율을 붙이기 → 신호 계약(90일 위치)과 섞여 뺌

## 파일 계획
- packages/shared/src/fx.ts
- apps/api/src/features/fx/changes.ts
- apps/api/src/features/fx/changes.test.ts
- apps/api/src/features/fx/routes.ts
- apps/api/src/features/fx/store.ts
- apps/web/src/shared/api.ts
- apps/web/src/app/page.tsx
- apps/web/src/features/home/home.tsx
- apps/web/src/features/home/change.ts
- apps/web/src/features/home/change.test.ts
- docs/domain/fx.md
- .agents/specs/0096-fx-changes/**

## 계획 밖 변경 이유

## 위험
- 화면 PR 이 API 배포 전에 빌드되면 변화율 칸이 빔 (멈추지 않음 · 다음 빌드에 채워짐)

## 검증 계획
- API 테스트 (changesOf · 400) · 운영 D1 에서 30일 범위 통화마다 20일 확인
- 배포 뒤 운영 /fx/changes · 홈 화면

## 계획과 달라진 점
- 홈 통화 칸을 링크로 감쌀 때 Card 대신 바깥 Link 에 key (Card 는 그대로)
