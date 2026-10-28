# 계획

## 무엇을 · 왜
- 단일 Next.js 앱을 `apps/web`(@hav/web) 으로 옮기고 Turborepo 세팅 — 디자인 시스템(`packages/ui`) · API(`apps/api`)가 들어갈 자리
- 루트 스크립트를 `turbo run …` 으로 → 게이트(`checks.sh`)는 그대로 루트 스크립트를 부름
- `packages/config`: 공용 tsconfig (Turborepo 권장: 루트 tsconfig 두지 않음)

## 애매한 곳
- 모노레포 · Turborepo · apps/web (확인됨: "1번으로 가야지" · "터보레포 형식으로")
- 작업 순서 디자인 문서 → 모노레포 → 디자인 시스템 (확인됨: "오케이 시작")
- 패키지 매니저 npm workspaces · 이름 `@hav/…` (가정 — architecture.md)
- turbo 2.11.10 (npm 최신 확인) (가정)
- `apps/api` · `packages/ui` · `packages/shared` 는 이번에 안 만듦 — 각자 이슈 (가정)
- eslint 공용 설정은 아직 `apps/web` 안에 — 두 번째 앱이 생길 때 `@hav/config` 로 (가정)
- Next.js `agentRules: false` — 모노레포에서 `next dev` 가 `apps/web/AGENTS.md` 를 새로 만듦(직접 실험) → 끄고 안내 블록은 루트 AGENTS.md 에서 손으로 관리 (가정)
- 보호 파일 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- package.json
- package-lock.json
- turbo.json
- apps/web/**
- packages/config/**
- src/**
- eslint.config.mjs
- next.config.ts
- tsconfig.json
- vitest.config.ts
- .gitignore
- AGENTS.md
- .agents/protected.txt

## 계획 밖 변경 이유

## 완료 기준
- [x] typecheck · lint · test · build 를 turbo 로 실행 · 통과 (`Tasks: 1 successful` · `apps/web/out/` 생성)
- [x] `agentRules: false` 후 `next dev` 가 AGENTS.md 를 만들지 않음 (직접 확인)
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- 밖 쓰기 훅 오탐 **3번째**: 명령 중간의 `cd apps/web` 를 따라가지 못해 저장소 안 `../../.tmp/dev.log` 를 밖으로 판단 (훅은 첫 `cd` 만 봄)
- Next.js 16 은 모노레포에서 앱 폴더마다 AGENTS.md 를 새로 만듦 → 0002 에서 루트에 블록을 미리 커밋한 방법은 모노레포에서 통하지 않음
- 보호 목록의 `next.config.*` · `wrangler.toml` · `.env*` 는 루트만 잡았음 → 파일이 `apps/web/` 로 옮겨지면 보호가 풀림 (`**/` 로 고침)
- GitHub 자동 머지는 필수 검사(required check)가 없으면 CI를 기다리지 않고 바로 머지됨 → 이번엔 자동 머지 대신 CI 확인 후 직접 머지
