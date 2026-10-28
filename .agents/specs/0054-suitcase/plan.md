# 계획

## 무엇을 · 왜
- 🧳 **여행 가방 캐릭터** (three.js 도형 · 모델 파일 없음) — 만드는 중 패널 위에 앉아 실제 기록에 따라 표정 · 동작이 바뀜 (docs/design.md 🧳 표)
- three.js 를 **디자인 시스템으로** (`@hav/ui/three/*`)
  - `stage` — 화면 밖이면 멈춤 · WebGL 없으면 빈 칸 · 움직임 줄이기면 한 번만 그림 · 픽셀 밀도 최대 2 · 토큰 색 읽기
  - `globe` · `geo` — 지구본을 그대로 옮김 (출발지 · 호 색은 받기만 · 여행지 목록은 앱에)
  - `suitcase` — 캐릭터 (표정은 이름만 받음: typing · looking · working · browsing · happy · startled · sad · sleeping · neutral)
- 앱(`features/log/mood.ts`): 기록 → 표정 고르기 (테스트)
- 늦게 불러오기(next/dynamic)는 앱에 (`shared/three-lazy.tsx`) — 디자인 시스템은 Next 를 모름
- 성능: 만드는 중 · 홈 Lighthouse 모바일 측정 → docs/design.md

## 애매한 곳
- 귀여운 캐릭터 · three.js · 재밌게 (확인됨: 원문)
- 🧳 여행 가방 (가정 — 0046 에서 정하고 사용자에게 알림 · 이의 없음)
- 두 곳 이상 쓰면 디자인 시스템 · three.js 도 (확인됨: 원문) — 지구본은 지금 홈만 쓰지만 "넘길수 있으면 넘기고" 라서 옮김
- 표정은 실제 기록이 들어올 때만 바뀜 · 쉬는 중(10분)이면 꾸벅 (가정 — 0050 과 같은 기준)
- 크기: 데스크톱 180px · 휴대폰 120px · 패널 오른쪽 위에 걸터앉음 (가정)
- 보호 파일(잠금 파일) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- packages/ui/**
- apps/web/src/features/globe/**
- apps/web/src/features/home/**
- apps/web/src/features/log/**
- apps/web/src/shared/**
- apps/web/package.json
- package-lock.json
- docs/design.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 표정 고르기 테스트: 종류 · 통과/실패 · 쉬는 중 · 기록 없음 · 화면 읽기 글
- [x] 지구본 수학 테스트는 디자인 시스템으로 옮겨서도 통과 (같은 좌표를 테스트 안에 둠)
- [x] 로컬에서 기록을 보내면 캐릭터 표정이 바뀜 — 키보드 · 폴짝 · 화들짝 · 돋보기 · 시무룩 · 톱니 화면 확인 (꾸벅 · 화면 보기는 테스트로만)
- [x] 휴대폰 폭(가로 넘침 없음 · 패널 위 모서리) · 홈 지구본 그대로
- [x] 성능 측정값 기록 (3번 중앙값 · 홈 86→89 · 만드는 중 81→79)
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영 확인

## 허점
- 휴대폰에서 캐릭터가 패널 뒤에 숨었음 → z-10
- Lighthouse 한 번 잰 값은 크게 흔들림 (같은 코드 30 ↔ 89) → 0048 에 적은 30점은 틀린 값이었음 · 3번 중앙값으로 고쳐 적음
- 캐릭터 TBT +100ms — 더 줄이려면 화면에 들어올 때만 불러오기(지금은 페이지 열 때)
