# 계획

## 무엇을 · 왜
- 만드는 중 페이지의 "작업 일지" 칸을 뺌 — 사용자 요청 (작업 0090 · 0103 에서 넣은 것)
  - 칸 · 작업 폴더 읽기 · 가림 처리 코드 · 테스트 · e2e 한 개 지움
  - 원문 · 허점은 저장소 .agents/specs 에 그대로 있음

## 애매한 곳
- 칸 전체를 뺌 (가정 · 캡처가 칸 머리였음)

## 파일 계획
- apps/web/src/features/log/**
- apps/web/src/app/log/page.tsx
- apps/web/e2e/features.spec.ts
- docs/domain/build-log.md
- .agents/specs/0104-drop-journal/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드: log.html 에 일지 칸 없음 · e2e 통과

## 허점
- 일지 칸을 넣기 전에 사용자에게 보이는 큰 칸이라는 점을 따로 알리지 않음 — 큰 화면 변경은 머지한 뒤라도 바로 짧게 알릴 것
