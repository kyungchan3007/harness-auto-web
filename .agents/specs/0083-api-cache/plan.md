# 계획

## 무엇을 · 왜
- API 읽기 응답 캐시 — 사이트 빌드가 매번 통화 수십 개의 1년치 · 신호를 받아 D1 을 읽음 · 2026-10-29 빌드 수십 번에 하루 읽기 한도(500만 줄)를 넘김 (작업 0077 색인으로 1/20 로 줄였지만 빌드 횟수에 비례하는 건 그대로)
- D1 표 `api_cache` (키 → 응답 JSON) · Hono 미들웨어 `cached()` (`apps/api/src/db/cache.ts`)
  - 키 = 배포 버전(version_metadata) | UTC 날짜 | 경로?쿼리 → 같은 날 · 같은 코드면 두 번째 빌드부터 요청마다 **한 줄**만 읽음
  - 새 코드 배포 → 버전이 바뀌어 예전 응답 안 씀 · 날짜가 바뀜 → 신호 · 1년치의 "오늘 기준" 이 바뀌니 새 키
  - 환율 · 물가를 저장하면 표를 통째로 비움 → 새 자료가 바로 보임
  - 200 만 저장 · 캐시가 고장 나도(표 없음 등) 원래대로 DB 를 읽어 응답
- 대상: /fx/latest · /fx/:c/history · /signal · /signal/:c · /prices/levels
  - /tasks 는 뺌 — 작업 기록이 수시로 바뀌고(막힘 +1 · GitHub 동기화) 줄 수가 작음
- 보호 파일 (schema.ts · migrations · wrangler.jsonc) — 사용자가 "지금 해버려" 로 요청 (위 원문)

## 애매한 곳
- 캐시 위치: Workers Cache API 는 workers.dev 주소에서 동작하지 않아 D1 표로 (가정)
- 주말엔 자료 저장이 없어 지난 날짜 키가 하루 수십 줄씩 남음 → 평일 수집 때 비움 (가정 · 표가 작아 괜찮음)

## 파일 계획
- apps/api/src/db/cache.ts
- apps/api/src/db/cache.test.ts
- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/**
- apps/api/src/env.ts
- apps/api/wrangler.jsonc
- apps/api/src/features/fx/routes.ts
- apps/api/src/features/fx/store.ts
- apps/api/src/features/signal/routes.ts
- apps/api/src/features/prices/routes.ts
- apps/api/src/features/prices/store.ts
- .agents/specs/0083-api-cache/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 로컬 Worker: 5 경로 모두 첫 번째 miss · 두 번째 hit · 응답 본문 같음
- [ ] 운영: deploy-api 뒤 두 번째 요청이 x-cache: hit

## 허점
- 자동 모드가 라벨 달기를 막았을 때 "그때 PR 에만 한 허락" 으로 보고 멈춤 — 사용자는 이미 라벨을 달라고 했음 → 보호 파일 PR 은 라벨까지 달고 머지 (기억에 적음)
- 라벨 단 뒤 예전 게이트 실행을 rerun 하면 라벨 없던 때 상태로 다시 돌아 실패로 남음 — 라벨을 달면 새 실행이 알아서 돎 · rerun 하지 말 것
