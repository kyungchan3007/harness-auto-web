# Trace — 요구사항 ↔ 구현 ↔ 검사

| 요구 | 구현 | 검사 |
| --- | --- | --- |
| R1 | `apps/api/src/features/status/*` · `/status` | `status.test.ts` "2026-10-30 실제" · "계약 모양" |
| R2 | reasonOf · StatusRun | `status.test.ts` "이유는 분류만" |
| R3 | cached({ bucketMs }) · status-board POLL 5분 · hidden | `cache.test.ts` "구간 캐시" |
| R4 | `status-board.tsx` · log-page 맨 위 | e2e "작업실 — 사이트 상태 점검판" |
| R5 | site-nav · live-panel · log metadata | e2e 탭 제목 "Tripfx" · 메뉴 "작업실" |

## 허점
- 처음 설계에서 D1 사용량(보는 사람 수 × 요청)을 계산하지 않고 "캐시 안 씀" 으로 시작함 — 사용자가 짚음 · 새 읽기 경로는 "요청당 줄 수 × 요청 수" 를 먼저 적을 것
