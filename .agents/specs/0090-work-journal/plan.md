# 계획

## 무엇을 · 왜
- 만드는 중 페이지 끝에 "작업 일지" — 작업마다 요청 원문(그대로) · 허점 · 머지된 PR
  - 도메인 규칙 LOG-02 가 요구했는데 없었음 (실시간 기록 · 블록 탑만) · 이슈 #9
  - 빌드 때 저장소의 `.agents/specs/NNNN-*/` 를 읽음 (LOG-01) · request.md · plan.md · trace.md 의 "## 허점"
  - 이메일 · 토큰 모양 글자는 가림 (LOG-04) · 실제 작업 폴더 58개를 돌려 잘못 가린 곳 없음 확인
  - 최근 15개 · 나머지는 "더 보기" (details — 자바스크립트 없이)
  - 제목: 머지된 PR 이름 → 이슈 이름 → 계획 첫 마디

## 애매한 곳
- 애매한 곳 · 게이트 결과는 이번엔 뺌 (가정 · 원문 · 허점이 먼저) — LOG-02 에 남은 것으로 적음

## 파일 계획
- apps/web/src/features/log/journal.ts
- apps/web/src/features/log/journal.test.ts
- apps/web/src/features/log/journal-read.ts
- apps/web/src/features/log/journal-list.tsx
- apps/web/src/features/log/log-page.tsx
- apps/web/src/app/log/page.tsx
- docs/domain/build-log.md
- .agents/specs/0090-work-journal/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면 1280 · 375: 일지 58개 · 허점 111개 · PR 링크 · 가로 넘침 0 · 페이지 오류 0

## 허점
- 로컬 빌드가 Next fetch 캐시의 예전 /tasks 응답을 써서 "머지 기록 없음" 으로 보임 — 화면 확인 전에 .next/cache/fetch-cache 를 지울 것 (두 번째)
- 제목에 계획 첫 줄(하위 줄까지 붙인 것)을 그대로 써서 너무 길었음 — 화면에서 봄
