# 계획

## 무엇을 · 왜 (운영 기록을 열어 원인을 봄)
- 원인 1 — 커밋 · 올림 · PR 을 한 명령으로 했는데 PR 설명에 "checks.sh" 글자가 있어 훅이 "게이트 검사"로 셈 → 배포 단계 기록이 안 남음
- 원인 2 — `gh pr merge --delete-branch` 는 끝나면 main 이라 "PR 머지" 기록에 작업 번호가 빠짐
- 원인 3 — 머지된 PR 목록 동기화(sync-tasks)가 API 배포 · 이슈 때만 돌아서 화면만 바꾼 PR 은 "끝" 이 안 옴
- 고침
  - 훅(activity.mjs · 보호 파일): 따옴표 · heredoc 글을 빼고 분류 · 머지 · PR 만듦 · 올림을 먼저 봄 · 마지막 작업 번호를 .tmp 에 기억했다가 배포 쪽 기록에 붙임 (3시간)
  - 화면(stage.ts): 작업 번호 없는 배포 기록은 바로 앞 작업으로 셈 (예전 기록도)
  - 워크플로(sync-tasks.yml · 보호 파일): PR 이 main 에 머지되면 바로 동기화
- 원인 4 (머지 뒤 확인하다 찾음) — 동기화가 PR 제목에서 번호를 "[0056] 이름" 모양으로만 읽는데, 작업 0057 부터 "작업 0058: 이름" 으로 써서 머지 목록에 번호가 없음 → 끝을 못 알아봄 · `apps/api/src/features/tasks/sync.ts` 가 두 모양 다 읽음 (테스트)

## 애매한 곳
- 원인 · 고침 (가정 · 사용자: "왜이런거야 · 확인해봐" — 확인하고 고침)
- 보호 파일 두 개 — harness-approved 라벨 (에이전트 권한 · 지금까지처럼)

## 파일 계획
- .agents/scripts/activity.mjs
- .agents/scripts/harness.test.mjs
- .github/workflows/sync-tasks.yml
- apps/web/src/features/log/**
- docs/design.md
- apps/api/src/features/tasks/**

## 계획 밖 변경 이유
- .agents/scripts/activity.mjs · .agents/scripts/harness.test.mjs · .github/workflows/sync-tasks.yml (보호 파일) — 위 원인 1 · 2 · 3 · harness-approved 라벨로 승인

## 완료 기준
- [x] 테스트: 한 명령 커밋 · 올림 · PR → PR 만듦 · 설명 글 속 checks.sh 무시 · 머지 뒤 main 이어도 작업 번호 · 실제 기록 순서로 4 배포 · 머지 목록이면 끝
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영에서 이 작업(0066)이 4 배포 → 끝 으로 가는지 확인

## 허점
- PR 제목 모양을 바꾸면서 그 제목을 읽는 코드(sync.ts)를 확인하지 않았음 → 두 모양 다 읽게 · 테스트
- 단계 판단을 훅의 "고정 문장"에 기대면서, 그 문장을 고르는 규칙(먼저 맞는 줄)을 실제 긴 명령으로 시험하지 않았음 (작업 0056) → 실제로 쓴 명령 모양을 테스트에 넣음
