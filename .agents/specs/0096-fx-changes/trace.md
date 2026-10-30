# Trace — 요구사항 ↔ 구현 ↔ 검사

| 요구 | 구현 | 검사 |
| --- | --- | --- |
| R1 | `apps/api/src/features/fx/changes.ts` · routes `/fx/changes` | `changes.test.ts` "첫날 → 마지막 날" |
| R2 | changesOf 두 날 미만 뺌 | `changes.test.ts` "두 날 미만" |
| R3 | routes cached() | `db/cache.test.ts` |
| R4 | (화면 PR) | |
| R5 | 문구 "지난 1개월" | |

## 허점
- 없음
