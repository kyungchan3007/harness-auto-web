# 계획

## 무엇을 · 왜
- 점검판 회차 판정 창을 20분 → 5분 — 운영에서 15:09 예비 메우기(ensure-fx · 작업 0106)가 15:00 예약 회차 "수집함" 으로 잡힘 (예약은 실제로 안 돎)
  - 예약 실행은 회차 시각 30초 안에 시작 (10-29 03:00:30) · 메우기는 "마지막 수집" 줄에 보임

## 애매한 곳
- 없음

## 파일 계획
- apps/api/src/features/status/status.ts
- apps/api/src/features/status/status.test.ts
- .agents/specs/0107-status-slot-window/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [ ] 운영 /bff/status: 15:00 회차 missed · 마지막 수집 15:09

## 허점
- 판정 창을 넓게 잡을 때 "다른 길로 들어온 수집" 을 생각하지 않음 (같은 작업에서 메우기 길을 바로 더함)
