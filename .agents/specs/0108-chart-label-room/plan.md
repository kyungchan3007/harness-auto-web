# 계획

## 무엇을 · 왜
- 그래프의 "최고" 글자가 SVG 위쪽 밖(y≈0 위)에 그려져 기간 단추에 붙음 · "최저" 글자도 아래로 넘쳐 밑 글과 붙을 수 있음
- SVG 그림판 위아래에 글자 자리(28)를 더해 글자가 그래프 칸 안에 들어오게 함 — 홈 1년 흐름 · 통화 상세 둘 다

## 애매한 곳
- 여백 크기 28 (글자 13px + 점과의 간격) (가정)

## 파일 계획
- apps/web/src/shared/year-chart.tsx
- .agents/specs/0108-chart-label-room/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [ ] 최고 · 최저 글자가 SVG 칸 안에 들어옴

## 허점
- overflow-visible 로 칸 밖 글자를 허용해 둬서 위 요소와 겹치는 걸 못 봄
