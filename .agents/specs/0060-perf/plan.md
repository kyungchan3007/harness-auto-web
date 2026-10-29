# 계획

## 무엇을 · 왜
- 측정 먼저 (Lighthouse 12.8.2 모바일 · 3번 중앙값 · `.tmp/lh-run.sh`) → 원인을 보고 고침
- 운영 전 (2026-10-29): 홈 90 · 만드는 중 72 · 통화 89 · 계산기 98 — 원인
  - 첫 큰 글자(LCP)가 늦음: 떠오름(Reveal) · 첫 장면이 JS 전까지 opacity 0 → 글꼴보다 이게 컸음 (render delay 1.6초)
  - 홈 CLS 0.155: 지구본이 늦게 나타나며 통화 섹션을 밀어냄 · 통화 CLS 0.072: 동전 · 만드는 중 CLS 0.063: 기록 패널이 커짐
  - 만드는 중 TBT: 3D 두 장면을 처음부터 받음
- 고침
  - 떠오름 → CSS 만 (`@hav/ui/reveal` · tokens.css) · 만드는 중 첫 장면 숨김 없앰
  - 3D → `@hav/ui/lazy-near`: 화면 가까이 + 브라우저가 한가할 때만 받음 · 받기 전에도 같은 크기 빈 칸 (밀림 없음)
  - 기록 패널 → 받은 뒤 높이만큼 자리를 미리 잡음
  - 글꼴 → 다시 재 보니 LCP 2.3~2.6초 · 모든 페이지 96 이상이라 이번엔 손대지 않음

## 애매한 곳
- 무엇을 고칠지 (확인됨: 앞서 제안한 목록 · "끝나고 나서 성능 작업 하자")
- 3D 캔버스 두 개 합치기 — 하지 않음: 두 장면이 멀리 떨어진 섹션이고, 아래 장면은 이제 가까이 올 때만 받음 (가정)
- 휴대폰 폭에서 3D 가 안 뜨던 것 — 앱 미리보기 창의 휴대폰 흉내에서는 IntersectionObserver · ResizeObserver 가 아예 안 옴 (코드 없이 따로 시험해도 같음) → Lighthouse(진짜 크롬 휴대폰 흉내) 기록으로 확인 (가정)

## 파일 계획
- packages/ui/src/components/lazy-near.tsx
- packages/ui/src/components/reveal.tsx
- packages/ui/src/tokens.css
- apps/web/src/shared/three-lazy.tsx
- apps/web/src/features/log/**
- docs/design.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 미리보기 배포로 4페이지 3번 중앙값 — 전보다 나쁜 페이지 없음 · CLS 0.1 아래
- [x] 3D 가 휴대폰(Lighthouse)에서도 받아짐 · 데스크톱 화면 확인
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영 다시 재기

## 허점
- 지난번엔 "글꼴이 LCP 의 가장 큰 원인"이라고 짐작해 말했는데, 측정 기록(LCP 단계)을 열어 보니 원인은 opacity 0 숨김이었음 → 짐작 대신 LCP 단계 · 밀림 요소부터 보고 고침
- 3D 를 늦게 불러오면서 빈 칸 없이 null 을 그리던 것이 홈 CLS 0.155 의 원인이었음 (작업 0039 부터)
- 앱 미리보기 창의 휴대폰 흉내로는 IntersectionObserver 가 오지 않아 3D 가 안 뜬다고 착각할 뻔함 → 따로 시험해서 창 문제로 확인 · Lighthouse 기록으로 휴대폰 확인
