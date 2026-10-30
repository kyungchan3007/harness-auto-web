# 계획

## 무엇을 · 왜
- 운영 Lighthouse 점검(2026-10-30)에서 나온 것 고침 — 홈 접근성 94 · 만드는 중 96
  - 작업 일지 "원본: .agents/specs" 링크 주소가 오류 글자("Attempted to call REPO_URL() from the server …")였음 — "use client" 파일(task-desks)에서 내보낸 상수를 서버 파일에서 씀
    - REPO_URL 을 shared/site.ts 로 옮김
  - 홈 여행지 칸: 지금 도시가 아닌 칸을 투명도 40% 로 흐리게 → 글자 대비 1.7 ~ 3.6 (기준 4.5) · 27곳 — 투명도 대신 테두리 빛 · 조금 작게
  - 글 안 링크가 색만으로 구분됨 → 밑줄
- 같은 허점 두 번째 (0081 outageActive 빌드 깨짐 · 이번 REPO_URL) → 하네스로 막음
  - `apps/web/src/shared/client-boundary.test.ts` — 서버 파일이 "use client" 파일에서 컴포넌트가 아닌 값을 가져오면 테스트 실패 (게이트의 test 에서 돎)
  - 고치기 전 코드에서 돌려 두 곳(REPO_URL × 2)을 잡는 것을 확인

## 애매한 곳
- 없음

## 파일 계획
- apps/web/src/shared/site.ts
- apps/web/src/shared/client-boundary.test.ts
- apps/web/src/features/log/task-desks.tsx
- apps/web/src/features/log/journal-list.tsx
- apps/web/src/features/log/log-page.tsx
- apps/web/src/features/home/home.tsx
- apps/web/src/features/home/trip-scenes.tsx
- .agents/specs/0092-a11y-fixes/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 Lighthouse 접근성: 홈 100 · 만드는 중 100 · 링크 주소 정상

## 허점
- 작업 0090 에서 서버 파일이 "use client" 파일의 상수를 가져와 링크가 깨진 채 머지함 — 0081 과 같은 허점 두 번째 → client-boundary 테스트로 막음
- 화면 확인은 했지만 링크 주소(href)는 안 봄 — 새 링크는 주소까지 확인
