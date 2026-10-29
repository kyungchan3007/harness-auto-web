# 계획

## 무엇을 · 왜
- `app/sitemap.ts` — 공개 페이지 5개 + 통화 상세 (API 가 준 통화 전부 · 통화 페이지와 같은 목록)
- `app/opengraph-image.tsx` — 공유 미리보기 1200×630 · Pretendard 로 한글 · 숫자는 넣지 않음 (캐시돼 오래 남음)
- layout: metadataBase · openGraph(siteName · ko_KR) · twitter 카드 — 페이지 제목 · 설명이 og 로 그대로 나옴
- `app/not-found.tsx` — 한국어 404 · 검색 제외
- `/design` 검색 제외 (개발용 확인 페이지)
- `public/_headers` — 확장자 없는 미리보기 이미지를 image/png 로
- API 받기 재시도 (연결 끊김 · 시간 초과 · 5xx · 429 만 · 두 번 더)
- `mustHave` — 운영 빌드(Cloudflare Pages · main)에서 오늘 환율 · 통화 목록을 못 받으면 빌드를 멈춤 → 예전 배포가 남음

## 애매한 곳
- robots.txt 는 Cloudflare 가 관리하는 파일(content signals)이 이미 나와서 만들지 않음 (가정)
- 미리보기 이미지 문구: "오늘, 그 통화는 싼 편일까?" (가정 · 신호 문장 톤)
- 운영 빌드만 멈춤 · 미리보기 · 로컬은 "자료 없음" 화면 그대로 (FX-02)

## 파일 계획
- apps/web/src/shared/site.ts
- apps/web/src/shared/api.ts
- apps/web/src/shared/api.test.ts
- apps/web/src/app/sitemap.ts
- apps/web/src/app/opengraph-image.tsx
- apps/web/src/app/not-found.tsx
- apps/web/src/app/layout.tsx
- apps/web/src/app/page.tsx
- apps/web/src/app/currencies/[code]/page.tsx
- apps/web/src/app/design/page.tsx
- apps/web/public/_headers
- .agents/specs/0076-site-meta/**

## 계획 밖 변경 이유

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [x] 빌드: out/sitemap.xml · out/opengraph-image(PNG 1200×630) · out/404.html 한국어 · og 태그
- [x] `CF_PAGES=1 CF_PAGES_BRANCH=main` 빌드가 API 500 일 때 "운영 빌드 멈춤" 으로 실패
- [ ] D1 한도가 풀린 뒤(00:00 UTC) 머지 · 배포 확인

## 허점
- 빌드가 API 실패를 "자료 없음" 으로 삼켜서, 운영 사이트가 깨질 수 있다는 걸 D1 한도 초과 때에야 앎 → mustHave 로 막음
- 운영 API 연결이 가끔 끊김(ECONNRESET) — 재시도로 막음
