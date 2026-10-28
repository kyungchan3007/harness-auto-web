# 계획

## 무엇을 · 왜
- 주소(tripfx.pages.dev)와 정적 화면은 그대로 · 같은 주소의 `/bff/*` 를 **Pages Functions** 로 만들어 API Worker 를 **서비스 바인딩**으로 부름
  - 브라우저는 같은 주소만 부름 → CORS 없음 · API 주소가 화면 코드에 안 들어감 · 캐시를 한곳에서 정함
  - 다음 PR 의 "만드는 중" 페이지가 `/bff/activity` 를 몇 초마다 읽음
- 로직은 `apps/web/src/bff/proxy.ts` (테스트 있음) · `functions/bff/[[path]].ts` 는 그것만 부르는 얇은 파일
- 허용 목록만 통과: `GET` · `activity` · `fx` · `signal` · `prices/levels` — 쓰기(POST) · `/fx/collect` 같은 관리 경로는 404
- 캐시: 작업 기록 3초 · 환율 · 신호 · 물가 5분
- 홈 성능 측정 (지구본 포함) — 기준값을 문서에

## 애매한 곳
- SSR 없이 BFF 만 · 주소 유지 (확인됨: "Pages 유지 · BFF만")
- Pages 루트 디렉터리가 저장소 맨 위라 `functions/` · `wrangler.jsonc` 를 맨 위에 둠 (가정 — 대시보드 설정을 안 바꾸려고)
- `wrangler.jsonc` 가 생기면 Pages 바인딩은 이 파일이 원본 (대시보드에서 못 바꿈) (가정)
- 성능 측정은 Lighthouse 모바일 · 로컬 정적 빌드 기준 (가정)
- 보호 파일(wrangler.jsonc · 잠금 파일) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- wrangler.jsonc
- functions/**
- apps/web/src/bff/**
- docs/architecture.md
- docs/design.md
- tsconfig.json

## 계획 밖 변경 이유

## 완료 기준
- [x] proxy 테스트 7개: 허용 경로만 · GET 만 · 머리글 안 넘김 · 캐시 · 실패 캐시 안 함 · 502
- [x] 로컬 `wrangler pages dev` + 로컬 API (서비스 바인딩): 홈 200 · fx/latest · activity · signal/JPY 200 · fx/collect 404 · POST 405
- [x] PR 미리보기 배포에서 `/bff/fx/latest` · `/bff/activity` 200 · `/bff/fx/collect` 404 (실제 데이터)
- [x] 홈 성능 측정값 기록 (모바일 30점 — docs/design.md · 고치는 건 다음 PR)
- [ ] bash .agents/checks.sh PASS · CI · 머지

## 허점
- functions/ 의 얇은 파일은 타입 검사 밖 (Pages 빌드가 묶다가 틀리면 미리보기 배포가 실패로 알려 줌)
- 엣지 캐시(Cache API)는 안 씀 — 브라우저 캐시만 · 부하가 생기면 추가
