# 계획

## 무엇을 · 왜
- 이슈 담당자(Assignees)를 kyungchan3007 로 — 사용자 요청
  - 이미 있는 이슈: 담당자 없던 16개(#12 ~ #46)를 `gh issue edit --add-assignee` 로 지정함 (코드 변경 아님) → 담당자 없는 이슈 0개
  - 앞으로: 이슈 양식 두 개에 `assignees: ["kyungchan3007"]`
  - 에이전트가 `gh issue create` 로 만들 때도 `--assignee kyungchan3007` (기억에 적음)

## 애매한 곳
- PR 담당자는 요청에 없어 그대로 둠 (가정)

## 파일 계획
- .github/ISSUE_TEMPLATE/agent-mistake.yml
- .github/ISSUE_TEMPLATE/improvement.yml
- .agents/specs/0084-issue-assignee/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 담당자 없는 이슈 0개

## 허점
- 없음
