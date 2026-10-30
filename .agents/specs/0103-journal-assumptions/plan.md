# 계획

## 무엇을 · 왜
- 작업 일지에 "애매한 곳" — 물어서 정한 것 (확인됨: 답) · 스스로 정한 것 (가정) (LOG-02 의 남은 것 · 작업 0090 에서 뺐던 것)
  - plan.md · prd.md 의 "## 애매한 곳" 목록 · "없음" 은 뺌 · 확인됨은 파란 점 · 가정은 회색 점
- 머지 직후 빌드는 작업 동기화보다 먼저 돌 수 있어 "머지 전" 이 틀린 말 → "머지 기록 아직 없음"

## 애매한 곳
- 없음

## 파일 계획
- apps/web/src/features/log/journal.ts
- apps/web/src/features/log/journal.test.ts
- apps/web/src/features/log/journal-read.ts
- apps/web/src/features/log/journal-list.tsx
- docs/domain/build-log.md
- .agents/specs/0103-journal-assumptions/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 · e2e 22개 통과

## 허점
- 로컬 빌드 전에 fetch 캐시를 또 안 지움 (세 번째) — 빌드 명령에 묶음: .tmp 스크립트 대신 `rm -rf apps/web/.next/cache/fetch-cache && npx turbo run build …` 를 한 줄로만 씀
