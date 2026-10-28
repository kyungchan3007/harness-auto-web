# 계획

## 무엇을 · 왜
- 만드는 중 페이지의 지난 작업 카드가 비어 있음: Pages 빌드 서버가 GitHub API 를 인증 없이 불러 403 (IP 를 여럿이 같이 써서 시간당 60번이 이미 참)
- 바꿈: **GitHub Actions** 가 자동 토큰(작업이 끝나면 사라짐)으로 이슈 · 머지된 PR 목록을 받아 **D1** 에 저장 → 페이지는 우리 API(BFF)에서 읽음
  - 새 비밀값 없음 — D1 쓰기는 배포용으로 이미 있는 `CLOUDFLARE_API_TOKEN`
  - 언제: API 배포가 끝난 뒤(머지마다) · 이슈가 열리거나 제목이 바뀔 때 · 손으로
- `apps/api/src/features/tasks/`: GitHub 목록 → 행 (`sync.ts`, 테스트) · `GET /tasks` (이름 · 지난 작업)
- `apps/api/scripts/tasks-sql.ts`: 워크플로가 부르는 변환기 (JSON → SQL 파일)
- 웹: 빌드 때 GitHub 대신 우리 API · 브라우저에서 `/bff/tasks` 로 한 번 더 (빌드가 저장보다 먼저 끝나도 채워지게)

## 애매한 곳
- 토큰 대신 Actions 자동 토큰 (확인됨: "그래그래")
- **저장소 주인이 연 이슈만** 작업 이름으로 씀 — 공개 저장소라 누구나 이슈를 열 수 있고, 그 제목이 사이트에 나오면 안 됨 (가정)
- PR 은 머지된 것만 (머지는 쓰기 권한이 있어야 함) (가정)
- 제목은 데이터 — SQL 에 넣을 때 따옴표 이스케이프 · 셸 명령에 끼워 넣지 않고 파일로만 넘김 (가정)
- 저장할 때 표를 통째로 바꿈 (최근 100개씩 · 작음) (가정)
- 보호 파일(.github/workflows/** · schema.ts · migrations/**) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- apps/api/**
- packages/shared/**
- apps/web/src/features/log/**
- apps/web/src/bff/**
- .github/workflows/sync-tasks.yml
- docs/architecture.md

## 계획 밖 변경 이유
- apps/web/src/features/log/log.test.ts 에서 GitHub 응답 읽기 테스트를 뺌 — 그 규칙(머지된 것만 · 작업 번호)은 apps/api 의 tasks.test.ts 로 옮겨 더 엄하게 (주인 이슈만 · 주소 · 이스케이프)

## 완료 기준
- [x] 변환 테스트: 주인 이슈만 · 머지된 PR 만 · 이상한 주소 버림 · 작업 번호 · 따옴표 · 줄바꿈 이스케이프
- [x] `GET /tasks` 응답 · `/bff/tasks` 허용 · 빌드 때 실패해도 브라우저에서 채움 (pickTasks)
- [x] 로컬 D1 에 실제 GitHub 목록(이슈 28 · 머지된 PR 24)을 SQL 파일로 넣고 `/bff/tasks` 로 읽음 · 빌드 때 404 → 브라우저에서 카드 24개
- [ ] 머지 후: 동기화 워크플로 성공 · 운영 `/log` 에 지난 작업 카드
- [ ] bash .agents/checks.sh PASS · CI · 머지

## 허점
- 동기화는 최근 100개씩만 (페이지 넘김은 `--paginate` 로 전부 받지만 표를 통째로 바꿈) · 이슈가 수천 개가 되면 나눠야 함
- 워크플로는 머지 직후 배포가 끝나야 돎 → 그사이 몇 분은 이전 목록
