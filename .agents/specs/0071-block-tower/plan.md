# 계획

## 무엇을 · 왜
- 🧱 블록 탑 3D (docs/design.md 확인된 3D 목록 · 지금까지 "나중")
- 머지된 작업 하나 = 블록 하나 · `/log` 끝 숫자 칸 · 홈 "만드는 중 입구"(작업 고양이 자리)에 넣음

## 애매한 곳
- 쌓는 모양: 젠가처럼 한 층 3개 · 층마다 엇갈림 (가정)
- 색: 아래 → 위 오로라 (청록 → 보라 → 핑크) · 맨 위 최신 블록만 떨어져 앉고 살짝 빛남 (가정)
- "막힌 작업은 빨간 블록": **뺌** — 머지된 PR 기록(/tasks)에 작업별 막힘 자료가 없음 · 실시간 기록은 최근 50줄뿐이라 작업마다 맞출 수 없음 (AGENTS.md 7: 받지 못한 값은 지어내지 않음)

## 파일 계획
- packages/ui/src/three/tower.ts
- packages/ui/src/three/tower.test.ts
- packages/ui/src/three/block-tower.tsx
- apps/web/src/shared/three-lazy.tsx
- apps/web/src/features/log/log-body.tsx
- apps/web/src/features/home/home.tsx
- docs/design.md
- .agents/specs/0071-block-tower/**

## 계획 밖 변경 이유

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [x] 홈 · /log (넓은 화면 · 휴대폰) 캡처 · 가로 넘침 0
- [ ] 배포 뒤 확인

## 허점
- 작업별 "막힌 횟수"가 저장되지 않아 설계의 빨간 블록을 못 만듦 → 만들려면 activity 기록의 blocked 를 작업 번호별로 모아 D1 에 두는 API 가 필요 (따로 작업)
