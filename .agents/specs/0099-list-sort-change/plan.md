# 계획

## 무엇을 · 왜
- 통화 목록 정렬 단추 — 기본 · 1개월 많이 싸진 순 · 많이 비싸진 순 (작업 0096 의 /fx/changes 한 번으로)
  - "어디 돈이 싸졌나" 로 여행지를 고르게 · 정렬하면 줄마다 지난 1개월 변화율
  - 변화율이 없는 통화는 뒤로 · 못 받으면 단추를 뺌 · 지난 값만 (예측 아님)
  - 즐겨찾기 맨 위는 기본 정렬일 때만
- 넓은 화면 왼쪽 목록이 좁아 긴 이름이 줄바꿈되며 숫자가 깨짐 → 이름은 말줄임 · 숫자는 한 줄

## 애매한 곳
- 없음

## 파일 계획
- apps/web/src/features/currencies/sort.ts
- apps/web/src/features/currencies/sort.test.ts
- apps/web/src/features/currencies/currency-list.tsx
- apps/web/src/features/currencies/browse-layout.tsx
- apps/web/src/app/currencies/**
- .agents/specs/0099-list-sort-change/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 1280 · 375: 싸진 순 EUR -3.2% 맨 위 · 비싸진 순 NOK +2.0% 맨 위 · 기본 엔화부터 · 가로 넘침 0

## 허점
- 줄에 숫자를 더하자 좁은 칸에서 줄바꿈 — 처음 화면에서 봄 · flex 안 링크는 min-w-0 이 있어야 줄어듦
