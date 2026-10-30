# 계획

## 무엇을 · 왜
- CI(GitHub) 게이트가 PR 의 작업 폴더를 못 찾던 것 고침
  - pull_request 는 PR 을 main 에 합친 떨어진 HEAD 를 받아서 브랜치 이름이 "HEAD" → 작업 번호 없음
  - 그래서 CI 에서는 Full 판정(build · e2e) · 작업 기록 검사 · 범위 검사가 모두 건너뛰어졌음 — 작업 0101 PR 도 CI 에선 "quick"
  - `branchName()` — GITHUB_HEAD_REF(PR 브랜치 이름)를 먼저 · 없으면 git
- 보호 파일 `.agents/scripts/**` — 사용자 지시 "알아서 진행 · 라벨도 니가"

## 애매한 곳
- 없음

## 파일 계획
- .agents/scripts/lib.mjs
- .agents/scripts/harness.test.mjs
- .agents/specs/0102-ci-branch-spec/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 하네스 테스트 22개 · GITHUB_HEAD_REF=task/0101-e2e-tests 이면 full
- [ ] 이 PR 의 CI 로그에 "작업 기록 (quick)" 이 건너뜀이 아니라 검사함

## 허점
- 하네스를 CI 에서 실제로 무엇을 검사하는지 본 적이 없음 — 로컬 PASS 만 봄 · 이번처럼 CI 로그로 확인
