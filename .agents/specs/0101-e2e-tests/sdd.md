# SDD — 어떻게

> 요구사항: [prd.md](prd.md)

## 접근
- `@playwright/test` (apps/web devDependency) · `channel: "chrome"` (기기 Chrome)
- `apps/web/e2e/serve.mjs` — out 을 Cloudflare Pages 처럼 (/currencies/USD → USD.html) 내는 작은 서버 · playwright webServer 가 띄움
- `apps/web/e2e/features.spec.ts` — 페이지 5곳 오류 검사 + 기능 6개 · 넓은 화면 · 휴대폰(Pixel 7) 프로젝트
- 저장소 맨 위 `test:e2e` → `npm -w @hav/web run test:e2e` (게이트가 맨 위 package.json 을 봄)

## 대안 · 트레이드오프
- puppeteer 스크립트(.tmp 에 쓰던 것)를 그대로 → 검사 · 보고 · 다시 시도가 없어 뺌
- Playwright 브라우저 내려받기 → 무겁고 CI 마다 받아야 해서 기기 Chrome

## 파일 계획
- apps/web/e2e/**
- apps/web/playwright.config.ts
- apps/web/package.json
- package.json
- package-lock.json
- .gitignore
- .agents/specs/0101-e2e-tests/**

## 계획 밖 변경 이유

## 위험
- e2e 는 빌드 때 받은 운영 API 값에 기댐 — API 가 멈춘 날 Full 작업 게이트가 실패 (값이 아니라 칸이 있는지만 봐서 "자료 없음" 이면 실패)
- GitHub 러너 Chrome 이 없어지면 실패 → 그때 `npx playwright install chrome`

## 검증 계획
- 로컬: `npm run test:e2e` 22개 통과 · 게이트 Full(build + test:e2e) PASS
- CI: 이 PR 의 checks (Full 루프)

## 계획과 달라진 점
- 계산기 칸을 `section` + has 로 찾았더니 페이지 바깥 section 이 잡힘 → aria-labelledby 로
