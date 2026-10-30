# Trace — 요구사항 ↔ 구현 ↔ 검사

| 요구 | 구현 | 검사 |
| --- | --- | --- |
| R1 | `apps/api/src/features/fx/changes.ts` · routes `/fx/changes` | `changes.test.ts` "첫날 → 마지막 날" |
| R2 | changesOf 두 날 미만 뺌 | `changes.test.ts` "두 날 미만" |
| R3 | routes cached() | `db/cache.test.ts` |
| R4 | `apps/web/src/features/home/home.tsx` 통화 칸 · `api.changes(30)` | 로컬 빌드 화면 1280 · 375 (엔 -1.9% · 링크 /currencies/JPY) |
| R5 | `features/home/change.ts` "지난 1개월" · 지난 값만 | `change.test.ts` |

## 허점
- API 배포(04:19 UTC)가 13:30 KST 다시 수집 예약(04:30 UTC) 11분 전 — 작업 0094 에서 본 "배포 직후 예약 놓침" 이 또 날 수 있음 · 15:00 KST 예약이 예비 · 수집 예약 앞 15분에는 API 를 머지하지 말 것
