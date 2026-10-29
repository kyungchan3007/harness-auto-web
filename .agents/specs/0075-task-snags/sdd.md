# SDD — 어떻게

> 요구사항: [prd.md](prd.md)

## 접근
- D1 새 표 `task_snags` (task 기본 키 · blocked · failed · since · updated_at)
  - 마이그레이션 0005: 표 만들기 + 지금 남은 activity_events 로 처음 값 (since = 그 작업의 가장 이른 기록 시각)
- `POST /activity` 저장 뒤 `snagOf(event)` 가 blocked/failed 면 그 작업 줄을 +1 (upsert)
- `@hav/shared/tasks` TasksSummary 에 `snags: Record<task, { blocked, failed }>` · `snagsSince: 시각 | null` — 둘 다 `.default` 로 예전 응답도 통과 (웹이 먼저 배포돼도 깨지지 않음)
- `summarize(rows, snags)` 순수 함수가 같이 만듦
- 웹: done(최근부터) → 아래가 오래된 순 블록 · `marks[i]` = 그 PR 의 작업에 막힘이 있나 · BlockTower 가 `marks` 를 받아 빨강(신호 "비쌈" 색 토큰)
- 탑 아래(또는 옆) 글자: "빨간 블록 N개 — 하네스가 막았거나 게이트가 실패했던 작업 · ○월 ○일 기록부터"

## 대안 · 트레이드오프
- activity_events 를 지우지 않기 → 표가 계속 커짐 · 공개 기록 범위가 넓어짐 → 고르지 않음
- 웹이 매번 /activity 전체를 받아 셈 → 500줄 넘으면 사라짐 → 고르지 않음

## 파일 계획
- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0005_*.sql
- apps/api/drizzle/migrations/meta/**
- apps/api/src/features/activity/store.ts
- apps/api/src/features/activity/activity.test.ts
- apps/api/src/features/tasks/routes.ts
- apps/api/src/features/tasks/tasks.test.ts
- packages/shared/src/tasks.ts
- packages/shared/src/activity.ts
- packages/ui/src/three/block-tower.tsx
- packages/ui/src/three/tower.ts
- packages/ui/src/three/tower.test.ts
- apps/web/src/features/log/**
- apps/web/src/features/home/home.tsx
- docs/design.md
- docs/domain/**
- .agents/specs/0075-task-snags/**

## 계획 밖 변경 이유
- 작업 0076 · 0077 · 0078 의 파일들 (specs · web · migrations 0004 · turbo.json 등) — 이 작업에서 바꾼 게 아니라 마이그레이션 번호를 맞추려고 main 을 병합하며 들어옴

## 위험
- schema.ts · 마이그레이션은 보호 파일 — 사용자 "알아서 진행 · 묻지 마" 지시(원문)를 승인으로 보고 harness-approved
- 마이그레이션 실패 시 API 배포가 멈춤 → 로컬 D1 에 먼저 적용해 봄

## 검증 계획
- 순수 함수 테스트: snagOf · summarize(snags) · 블록 marks
- 로컬 D1 마이그레이션 적용 · 배포 뒤 운영 /tasks · 캡처

## 계획과 달라진 점
- 마이그레이션 번호 0004 → 0005 — 작업 0077(fx_rates 색인)이 0004 로 먼저 머지됨 · main 을 병합하고 drizzle-kit 으로 다시 만듦
- 빨간 블록을 젠가처럼 바깥으로 빼냄 (`tower.ts` pulled) — 색만으로는 위쪽 핑크와 섞여 안 보였음
- `apps/web/src/features/log/log.test.ts` 시험 값에 snags · snagsSince 추가 (계약이 늘어서)
