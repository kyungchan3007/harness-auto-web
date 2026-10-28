# 계획

## 무엇을 · 왜
- 정한 주소를 설정 · 문서에 반영: 사이트 `tripfx.pages.dev` · API `tripfx-api.developfff.workers.dev`
- Worker 이름 `hav-api` → `tripfx-api` (workers.dev 주소가 Worker 이름을 따름)

## 애매한 곳
- 사이트 주소 tripfx.pages.dev (확인됨: "tripfx.pages.dev 이거 좋네")
- saju-me 도메인은 쓰지 않음 (확인됨: "saju-me 로 안할거라고")
- API 이름 tripfx-api (가정 — 사이트 이름에 -api)
- 2026-10-28 확인: `tripfx.pages.dev` DNS 없음 · `tripfx-api.developfff.workers.dev` 404 → 둘 다 쓰이지 않음 (만들 때 최종 확인)
- 보호 파일(wrangler.jsonc) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- apps/api/wrangler.jsonc
- apps/api/src/index.ts
- apps/api/src/index.test.ts
- docs/architecture.md

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- 주소 이름 이야기에서 사용자가 "saju-me 안 씀"을 두 번 말했는데 에이전트가 계속 saju-me 서브도메인을 권함 — 사용자의 앞선 결정("사주미로 안할거야")을 다음 제안에 반영하지 않음
