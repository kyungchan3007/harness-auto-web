# 계획

## 무엇을 · 왜
- docs/design.md "홈 화면 흐름" 2 · 4 · 5 · 6 장면을 채움 (지금은 1 첫 화면 · 3 통화 목록만)
- 2 여행지 고르기: 지구본 화면 고정 · 스크롤로 도쿄 → 뉴욕 → 파리 → 방콕 · 칸마다 오늘 통화 신호 + 물가(작업 0068 자료)
- 4 1년 흐름: 달러 1년 선 그래프 (통화 상세와 같은 그래프를 shared 로 옮김)
- 5 · 6 직구 계산기 · 만드는 중 입구 (고양이 · 머지된 작업 수)

## 애매한 곳
- 📈 3D 리본 대신 SVG 선 그래프 (가정 — 리본은 나중 · 같은 그래프를 두 곳이 쓰게)
- 🧱 블록 탑은 다음 작업 → 그때까지 만드는 중 입구는 작업 고양이
- 지구본 focus: 도착지 대신 서울 ~ 도착지 가운데를 앞에 (화면에서 보고 정함)

## 파일 계획
- apps/web/src/features/home/**
- apps/web/src/app/page.tsx
- apps/web/src/shared/year-chart.tsx
- apps/web/src/shared/chart.ts
- apps/web/src/features/currencies/year-chart.tsx
- apps/web/src/features/currencies/chart.ts
- apps/web/src/features/currencies/currency-detail.tsx
- apps/web/src/features/currencies/currencies.test.ts
- packages/ui/src/three/globe.tsx
- packages/ui/src/three/geo.ts
- packages/ui/src/three/geo.test.ts
- docs/design.md
- .agents/specs/0070-home-story/**

## 계획 밖 변경 이유

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [x] 넓은 화면 · 휴대폰에서 스크롤하면 칸마다 지구본이 그 도시로 (헤드리스 캡처 · aria-current 로 확인) · 가로 넘침 0
- [ ] 배포 뒤 tripfx.pages.dev 홈 확인

## 허점
- 로컬 빌드가 Next fetch 캐시(`apps/web/.next/cache/fetch-cache`)의 예전 API 응답을 써서 "머지된 작업 25개 · 예전 이름"이 나옴 — 배포 빌드는 41개로 정상. 로컬에서 숫자를 확인할 때는 캐시를 지우고 빌드할 것
- 헤드리스 크롬이 한 번에 페이지 두 개를 열면 WebGL 이 가끔 안 그려짐 → 캡처가 비면 페이지 하나씩 다시 찍어 확인
