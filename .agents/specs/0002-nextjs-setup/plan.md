# 계획

## 무엇을 · 왜
- Next.js 앱 뼈대를 만들고 게이트(typecheck · lint · test · build)가 실제로 돌게 연결 — 이후 작업이 게이트를 거치게 하려고
- 정적 내보내기(`out/`)로 Cloudflare Pages 에 올릴 수 있는 형태
- **아키텍처(폴더 구조) · 디자인 · 오픈 데이터 수집은 만들지 않음** — 사용자와 따로 논의

## 애매한 곳
- 범위: Next.js 만들고 아키텍처는 아직 X (확인됨: "next.js 만들고 아직 아키텍쳐 만들지마 여기에 대해서 나랑 이야기 해야하니까 하네스 구성 까지 하고")
- 디자인 · 오픈 데이터 수집: 사용자와 논의 뒤 (확인됨: "디자인 관련 해서 나랑 이야기 해야해 그리고 오픈소스 데이터 가져오는거도 이야기해야하고")
- 머지 · CI 이벤트 처리: 에이전트가 함 (확인됨: "머지까지 니가 시작해 … CI 하는과정에 생기는 이벤트나 이런거도 니가다해")
- 보호 파일 승인 라벨: 에이전트가 붙임 (확인됨: "라벨도 네가 붙여") → 로컬 ALLOW_PROTECTED=1 도 에이전트가 실행하고 PR 본문에 보호 파일 목록을 남김 (가정)
- Next.js 16.4.3 · TypeScript · App Router · `src/app` · import 별칭 `@/*` · ESLint (create-next-app 기본) (가정)
- 스타일 도구(Tailwind 등) 넣지 않음 — 디자인 논의 전 (가정)
- 테스트: vitest 5 · 테스트 파일 아직 없음 (`--passWithNoTests`) — 테스트 위치는 아키텍처 논의 뒤 (가정)
- 화면은 자리만: 사이트 이름 + "만드는 중" 안내 한 줄 (디자인 없음)

## 파일 계획
- package.json
- package-lock.json
- next.config.ts
- tsconfig.json
- eslint.config.mjs
- vitest.config.ts
- src/**
- public/**
- .gitignore
- AGENTS.md
- HANDOFF.md

## 계획 밖 변경 이유
- AGENTS.md — Next.js 16 `next dev` 가 에이전트를 감지하면 AGENTS.md 에 안내 블록을 자동으로 써 넣음 → 미리 커밋해 두지 않으면 개발 서버를 켤 때마다 보호 파일이 바뀜

## 완료 기준
- [x] typecheck · lint · test · build 각각 실행 · 통과 · `out/index.html` 생성
- [x] bash .agents/checks.sh PASS (Quick · 보호 파일 3개 에이전트 승인) · build 는 따로 `npm run build` 통과
- [ ] CI 통과 · 머지

## 허점
- Next.js 16 은 `next dev` 가 AGENTS.md(보호 파일)를 자동 수정 — 하네스 보호 파일과 프레임워크 도구가 충돌
- 기억에 기대 `vitest@3` 을 골랐다가 치명 취약점 2개 (최신 5.0.5 로 해결) — 의존성 추가 전 `npm view <pkg> version` · `npm audit` 확인 필요
- Quick Loop 게이트는 build 를 돌리지 않음 → CI 도 Quick 이면 build 깨짐을 못 잡고 머지될 수 있음. `LOOP=full` 로 build 만 보려 해도 prd · sdd · trace 를 요구
- `LayoutProps` 같은 Next 16 전역 타입은 `next typegen` 이 먼저 돌아야 typecheck 통과 → typecheck 스크립트에 포함
