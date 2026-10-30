# Trace — 요구사항 ↔ 구현 ↔ 검사

| 요구 | 구현 | 검사 |
| --- | --- | --- |
| R1 | `apps/web/playwright.config.ts` · `e2e/serve.mjs` · `test:e2e` | 게이트 Full "프로젝트 test:e2e" |
| R2 | `channel: "chrome"` | 로컬 · CI 실행 |
| R3 | `features.spec.ts` "페이지 오류 없음" × 5 | 같은 곳 |
| R4 | `features.spec.ts` 계산기 · 기간 · 예산 · 즐겨찾기 · 일지 · 정렬 | 같은 곳 |
| R5 | projects 넓은 화면 · 휴대폰 | 22개 |

## 허점
- 게이트가 "스크립트가 없으면 건너뜀" 이라 e2e 가 처음부터 없었는데 PASS 로 보였음 — 건너뛴 것도 결과에 보이게 하는 건 하네스 원본(harness-template) 쪽 일
