# 계획

## 무엇을 · 왜
- 홈의 6번 장면 "만드는 중 입구"(블록 탑 미리보기 · 머지된 작업 수)를 뺌 — 사용자 요청
- 홈이 더는 /tasks 를 안 받음 (빌드 때 API 호출 하나 줄어듦) · /log 로 가는 길은 꼬리말 링크 · 위 메뉴 "만드는 중" 이 그대로 있음

## 애매한 곳
- 블록 탑은 /log 에만 남김 (가정 · 사용자가 뺀 건 홈 입구)

## 파일 계획
- apps/web/src/features/home/home.tsx
- apps/web/src/app/page.tsx
- docs/design.md
- .agents/specs/0079-drop-home-making/**

## 계획 밖 변경 이유

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [ ] D1 한도가 풀린 뒤 사이트 다시 빌드에서 홈에 그 섹션 없음 (지금은 API 500 이라 운영 빌드가 멈춤 — 작업 0078)

## 허점
- 로컬 빌드는 생략 — 빌드마다 운영 D1 을 읽고 지금은 한도 초과 중 (타입 검사 · 린트로 확인)
