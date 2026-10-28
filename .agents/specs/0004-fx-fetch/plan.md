# 계획

## 무엇을 · 왜
- 하루치 환율 수집: 수출입은행 → 실패면 Frankfurter 예비 → D1 저장 · 실행 기록 (`apps/api/src/features/fx/`)
- Cron(평일 12:00 KST) 연결 · 읽기 API(`/fx/latest` · `/fx/:통화/history`) · 관리용 수집 API(`POST /fx/collect`, 과거 날짜 채우기)
- 화면 · 신호 계산 · 직구 · 물가는 범위 밖 (각자 이슈)

## 애매한 곳
- 출처: 수출입은행 주 + Frankfurter 예비 (확인됨: "전부 추천대로")
- 저장: D1 + Drizzle · Worker Cron (확인됨: "D1 + 나중에 바꿀수 있게") — 이슈 본문의 `src/data/schema.*` · `scripts/fetch/` · "CI 예약 실행"은 이 결정으로 대체
- 수출입은행 명세는 공식 페이지에서 직접 확인 (RESULT 코드 · 비영업일 null · 하루 1,000회 · 새 주소 oapi)
- "실패"(키 없음 · 인증 · 한도 · HTTP)만 예비로 넘어가고 "데이터 없음"(비영업일)은 넘어가지 않음 (가정)
- 예비는 **주말을 채우지 않음** — 실제 로컬 수집에서 Frankfurter 가 일요일 값을 줘서 141개가 들어간 것을 보고 정함 (가정)
- 공식 환율 우선: 수출입은행은 덮어쓰고 예비는 이미 있는 줄을 건드리지 않음 (가정)
- 송금 환율이 둘 다 0 인 통화(유로 이전 옛 통화 등)와 원화 자신은 저장 안 함 (가정)
- 관리용 수집 API: `ADMIN_TOKEN` 이 없으면 404 (경로 꺼짐) · 있으면 Bearer 토큰 · 길이 무관 비교 (가정)
- 비밀값 `KOREAEXIM_KEY` · `ADMIN_TOKEN` 은 이름만 코드에 — 로컬 `.dev.vars`(커밋 제외 · 보호) · 실제는 사람이 `wrangler secret`

## 파일 계획
- apps/api/**
- package.json
- package-lock.json
- .gitignore
- .agents/protected.txt
- docs/domain/fx.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 단위 테스트 25개 (응답 읽기 · 예비 전환 · 주말 · 다른 날짜 · 둘 다 실패 · 입력 검증 · 토큰)
- [x] 로컬 실제 수집 (키 없음 → Frankfurter): 평일 3일 164~169 통화 · 주말 2일 empty · Cron 실행으로 오늘 144 통화 · 실행 기록 출처 맞음
- [x] typecheck 통과
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- 실제로 돌려 보고서야 찾은 것 2개: Frankfurter 주말 값이 그대로 들어감 · 예비로 넘어가도 실행 기록 출처가 koreaexim 으로 남음 → 둘 다 테스트로 고정. 단위 테스트만 믿었으면 놓쳤음
- 테스트 기대값을 암산으로 적었다가 틀림 (1/0.00075274 = 1328.48) — 계산은 도구로
- Cron 직후 바로 읽어 "저장 안 됐다"고 오판할 뻔 (waitUntil 이 끝나기 전) — 다시 읽어 확인
- 평일 공휴일은 수출입은행이 실패한 날 예비가 채울 수 있음 — 공휴일 목록 생기면 막기
