# Trace — 과정 기록

> 판단과 이유를 작업하면서 남긴다. 나중에 재구성하지 않는다

| 순서 | 단계 | 한 일 | 판단 · 이유 |
| --- | --- | --- | --- |
| 1 | 조사 | activity_events 는 최근 500줄만 남김 (ACTIVITY_KEEP) · 운영 DB 막힘: 0058 게이트 실패 3 · 0069 막음 2 · 0070 게이트 실패 1 · 작업 번호 없는 막음 1 | 지난 작업 막힘은 지워져 모름 → 따로 쌓는 표가 필요 |
| 2 | 계약 | TasksSummary 에 snags · snagsSince (둘 다 default) | 웹이 API 보다 먼저 배포돼도 예전 응답이 통과 |
| 3 | 저장 | POST /activity 저장 뒤 snagOf 가 막힘이면 task_snags upsert +1 | drizzle onConflictDoUpdate 가 만든 SQL(`on conflict ("task_snags"."task")`)을 로컬 D1 에서 두 번 실행해 2 가 되는 것 확인 |
| 4 | 마이그레이션 | 0004: 표 + 지금 남은 기록으로 처음 값 · since = 남은 기록 중 가장 이른 시각 | 로컬 D1 적용 확인 |
| 5 | 화면 | blockMarks · snagText (shared) · BlockTower marks → 빨강 | 첫 캡처에서 빨강이 위쪽 핑크와 섞이고 뒤에 숨음 → 젠가처럼 긴 쪽으로 0.28 빼냄 · 살짝 빛남 |
| 6 | 확인 | 운영 API 를 넘기며 /tasks 에만 운영 DB 값을 붙인 시험 서버로 빌드 · 캡처 | 시험 서버가 운영 API 연결 끊김(ECONNRESET)에 꺼져 한 번 빈 화면 → 다시 시도 · 502 로 고침 |
| 7 | 병합 | main 병합 · 0004_task_snags 를 지우고 0005 로 다시 만듦 · 처음 값 채우기는 그대로 붙임 · 새 로컬 DB 에 0000~0005 적용 확인 | 작업 0077 이 0004 를 먼저 씀 |

## 허점
- 로컬 wrangler dev 가 응답하지 않음(000) — 오래 띄워 둔 dev 서버는 믿지 말고 확인용 서버를 따로 띄울 것
