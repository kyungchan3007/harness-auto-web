# 계획

## 무엇을 · 왜
- 사이트 빌드는 `turbo run build` 로 도는데 turbo(엄격 환경 모드)가 turbo.json 에 없는 환경 변수를 걸러 냄 → `CF_PAGES` · `CF_PAGES_BRANCH` 가 next build 에 안 가서 mustHave 가 운영 빌드를 못 알아봄
- 로컬 재현: `CF_PAGES=1 CF_PAGES_BRANCH=main npx turbo run build --filter=@hav/web --force` → API 500 인데 성공 (고치기 전) · 실패 "운영 빌드 멈춤" (고친 뒤)
- 고침: build 작업에 `passThroughEnv: [CF_PAGES, CF_PAGES_BRANCH]` (캐시 열쇠에 안 넣음) · `env: [TRIPFX_API_URL]` (API 주소가 바뀌면 다시 빌드)
- turbo.json 은 보호 파일 — 사용자 "라벨도 니가 달고 진행해줘"

## 애매한 곳
- 이미 배포된 "자료 없음" 사이트는 이 고침으로 돌아오지 않음 (새 빌드가 멈출 뿐) → Cloudflare 대시보드에서 직전 정상 배포(27e564b4 · 커밋 15a6608)로 되돌리기가 필요 — wrangler 에 Pages 되돌리기 명령이 없음

## 파일 계획
- turbo.json
- .agents/specs/0078-turbo-env/**

## 계획 밖 변경 이유

## 완료 기준
- [x] 로컬에서 turbo 를 거친 운영 빌드가 API 500 일 때 멈춤
- [x] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [ ] 머지 뒤 main 사이트 빌드가 실패(배포 안 됨)

## 허점
- 작업 0076 에서 `next build` 를 바로 돌려 확인했고 실제 빌드 경로(turbo)로는 확인하지 않았음 → 운영 동작은 실제와 같은 명령으로 확인할 것
- 이 허점 때문에 운영 사이트가 "자료 없음"으로 덮임 (2026-10-29 약 12:00 UTC)
