# 계획

## 무엇을 · 왜
- 사용자가 만든 실제 D1 `hav-db` 의 id 를 `apps/api/wrangler.jsonc` 에 넣음 — 배포 · 원격 마이그레이션이 이 DB 를 쓰게

## 애매한 곳
- 무료 주소로 감: 사이트 `tripfx.pages.dev` · API `tripfx-api.developfff.workers.dev` (확인됨: "일단 그러면 무료로 사용하고")
- database_id 는 비밀값이 아님 (Cloudflare 계정 접근 없이는 쓸 수 없는 식별자) (가정)
- `wrangler d1 list` 로 같은 id 의 `hav-db` 가 계정에 있는지 확인함
- 보호 파일(wrangler.jsonc) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- apps/api/wrangler.jsonc

## 계획 밖 변경 이유

## 완료 기준
- [x] `wrangler d1 list` 에 `hav-db` · 같은 id
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
-
