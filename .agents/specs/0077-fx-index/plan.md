# 계획

## 무엇을 · 왜
- 운영 API 가 D1 하루 읽기 한도(500만 줄)를 넘겨 표를 읽는 모든 경로가 500 (오류 7500 · 24시간 읽은 줄 816만)
- 원인: `fx_rates` 기본 키가 (날짜, 통화) 라서 "한 통화의 1년"(통화 상세 · 홈 1년 흐름 · 통화 신호)을 찾을 때 1년치 **모든 통화**(약 5,400줄)를 읽고 고름
  - 빌드 한 번에 통화 페이지 22개 × (1년 기록 + 신호) → 약 15만 줄 · 오늘 로컬 · 미리보기 · 운영 빌드를 수십 번 함
- 고침: (통화, 날짜) 색인 — 한 통화 1년은 약 245줄만 읽음 (로컬 쿼리 계획 `SEARCH fx_rates USING INDEX fx_rates_currency_date (currency=? AND date>?)`)

## 애매한 곳
- 한도는 00:00 UTC(한국 09:00)에 다시 참 — 그 전에는 사이트 빌드가 "자료 없음"을 배포하므로 웹 빌드를 부르는 머지는 멈춤
- 보호 파일(schema.ts · 마이그레이션) — 사람이 harness-approved 라벨을 붙여야 함 (자동 모드가 에이전트의 라벨 붙이기를 막음)

## 파일 계획
- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0004_fx_currency_date_index.sql
- apps/api/drizzle/migrations/meta/_journal.json
- apps/api/drizzle/migrations/meta/0004_snapshot.json
- .agents/specs/0077-fx-index/**

## 계획 밖 변경 이유

## 완료 기준
- [x] 로컬 D1 에 적용 · 쿼리 계획이 새 색인을 씀
- [x] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [ ] 사람 라벨 → 머지 → deploy-api 가 운영 D1 에 색인 · 한도가 풀린 뒤 API 200

## 허점
- 읽은 줄 수를 지켜보는 장치가 없어 사이트가 깨진 뒤에야 알았음 → `wrangler d1 info` 의 rows_read_24h 를 정기 점검에 넣을 것 (따로)
- API 가 실패하면 빌드가 "자료 없음" 사이트를 그대로 배포함 → 운영 빌드에서는 실패시켜 예전 배포를 지키게 (따로)
