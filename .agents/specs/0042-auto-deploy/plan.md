# 계획

## 무엇을 · 왜
- `.github/workflows/deploy-api.yml`: main 에 API · 공용 스키마가 바뀌어 머지되면 D1 마이그레이션 → Worker 배포 (지금까지는 사람이 터미널에서 `wrangler deploy`)
- `.github/workflows/rebuild-site.yml`: 평일 12:30 KST (수집 30분 뒤) Pages 배포 훅을 불러 사이트를 다시 빌드 — 사이트가 빌드 때 데이터라, 안 하면 머지할 때의 환율이 계속 보임
- 사이트(Pages)는 이미 GitHub 연결로 머지마다 자동 배포

## 애매한 곳
- 자동 배포 (확인됨: "CI할때자동으로 배포될수 있게 해야지")
- 외부 GitHub Action(cloudflare/wrangler-action) 대신 저장소의 wrangler 를 `npx` 로 — 버전이 lock 파일에 고정 · 남의 코드를 덜 씀 (가정)
- 비밀값 3개는 사람이 GitHub 저장소 Secrets 에: `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `PAGES_DEPLOY_HOOK` — 없으면 배포 단계는 "건너뜀"으로 끝남 (실패 아님) (가정)
- API 배포는 main 의 게이트가 통과한 뒤 (`workflow_run`) (가정)
- 재빌드 시각 평일 03:30 UTC — GitHub 예약 실행은 몇 분 늦을 수 있음 (가정)
- 보호 파일(.github/workflows/**) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- .github/workflows/deploy-api.yml
- .github/workflows/rebuild-site.yml
- docs/architecture.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 워크플로 문법 확인 (Ruby YAML 로 읽음 · deploy-api 7단계 · rebuild-site 1단계)
- [ ] bash .agents/checks.sh PASS · CI · 머지
- [ ] 사람이 비밀값을 넣은 뒤: 수동 실행(workflow_dispatch)으로 배포 · 재빌드 확인

## 허점
-
