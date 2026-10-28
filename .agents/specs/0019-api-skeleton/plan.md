# 계획

## 무엇을 · 왜
- `apps/api`(@hav/api) 뼈대: Hono on Workers · D1 · Drizzle · Cron 자리 — 데이터 수집 · 알림이 들어갈 곳
- 환율 · 물가 · 수집 기록 테이블 스키마 + 첫 마이그레이션 · `/health` (DB 연결 확인)
- **로컬에서만.** Cloudflare 배포 · 실제 D1 생성 · 비밀값은 사람 (다음 단계) · 수집 코드는 별도 작업

## 애매한 곳
- 데이터 원본 D1 (확인됨: "D1으로 가자")
- 나중에 바꿀 수 있게 → Drizzle ORM (확인됨: "D1 + 나중에 바꿀수 있게")
- 공개 일지는 git 커밋 · PR 로 — 수집 기록 테이블은 운영용 (확인됨: "git 커밋이랑 PR보고 하면되는거잖아")
- drizzle-orm 0.45.4 · drizzle-kit 0.31.11 **안정판** — 공식 문서는 rc 를 권하지만 사전 공개판이라 피함 (가정)
- drizzle-kit 이 오래된 esbuild 를 끌고 와 중간 위험 4개 (esbuild 개발 서버 문제) — 개발 도구 · 배포 코드에 안 들어감 · `npm audit --omit=dev` 0개 → 받아들임 (가정)
- 금액은 REAL (소수 둘째 자리 환율 표시용) (가정)
- Cron 평일 03:00 UTC (12:00 KST) — 수출입은행 "영업일 11시 전후 갱신" 공식 안내 기준 (가정)
- `database_id` 는 자리 값 — 로컬은 그대로 동작, 실제 값은 사람이 `wrangler d1 create` 뒤 넣음
- 보호 목록: `**/wrangler.json(c)` · DB 스키마 · 마이그레이션 추가 (에이전트 승인: "라벨도 네가 붙여")
- eslint 는 아직 apps/web 만 — 공용 eslint 설정(@hav/config)은 별도 작업 (가정)

## 파일 계획
- apps/api/**
- package.json
- package-lock.json
- .gitignore
- .agents/protected.txt
- docs/architecture.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 로컬 D1 에 마이그레이션 적용 (테이블 3개) · `wrangler dev` 로 `/health` → 200 `{"ok":true,"db":true}` · 없는 경로 404
- [x] typecheck · test(3 패키지) · build(web + api dry-run) 통과
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- npm workspaces 에서 `npm i -w <pkg> A` 뒤 `npm i -w <pkg> -D B` 를 하면 앞의 dependencies 가 package.json 에서 빠짐 — **2번째** (0017 Base UI · 0019 hono · drizzle-orm). 설치 뒤 package.json 확인 필요
- 0017 에서 쓴 `checks.sh | grep && commit` 방식을 버리고, 게이트 종료 코드로 커밋을 막음
