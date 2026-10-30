# 계획

## 무엇을 · 왜
- 운영 사이트 6페이지를 크롬 · 사파리(WebKit) 엔진, 너비 320 · 375 · 768 · 1280 으로 열어 점검 (48화면) — 가로 넘침은 없음
- 고칠 곳 1: 320px 에서 위 메뉴 한 줄에 다 안 들어가 "직구 계산" · "작업실" 이 잘려 안 보임 → sm 아래에서 메뉴를 둘째 줄로 펼침
  - 메뉴 높이를 쓰는 고정 칸(홈 여행지 지구본 · 작업실 패널) top 을 휴대폰 5rem 으로 맞춤
- 고칠 곳 2: 그래프 최고 · 최저 글자가 SVG 안에 있어 그래프와 같이 줄어 휴대폰에서 6px 쯤 → HTML 글자로 얹어 크기 고정
- 파이어폭스: Playwright Firefox · 설치된 Firefox 모두 이 기기에서 headless 실행이 "Could not find profile folder" 로 실패 → 못 봄
- 엣지: 이 기기에 없음 · 크롬과 같은 엔진(Chromium)이라 크롬 결과로 갈음 (가정)

## 애매한 곳
- 휴대폰 메뉴를 두 줄로 (햄버거 메뉴 대신 · 링크 다섯 개라 펼쳐 두는 편이 한 번 덜 누름) (가정)

## 파일 계획
- packages/ui/src/components/nav-bar.tsx
- apps/web/src/shared/year-chart.tsx
- apps/web/src/features/log/log-body.tsx
- apps/web/src/features/home/trip-scenes.tsx
- .agents/specs/0109-responsive-fix/**

## 계획 밖 변경 이유

## 완료 기준
- [x] 고친 빌드를 크롬 · 사파리 48화면 다시 점검 — 넘침 없음 · 320 메뉴 다섯 개 보임
- [ ] bash .agents/checks.sh PASS

## 허점
- 점검이 1280 데스크톱 위주였음 · 320 너비를 e2e 에 넣지 않아 메뉴 잘림을 못 봤음
