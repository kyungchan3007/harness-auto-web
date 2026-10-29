# 계획

## 무엇을 · 왜
- 🧳 여행 가방 · 🐷 돼지 저금통 → 🐱 렉돌 고양이 두 마리 (실 포인트 미티드)
  - 몸 하나 `@hav/ui/three/ragdoll` (RagdollFigure · 표정 · 차림 gear)
  - 작업 고양이 `@hav/ui/three/worker-cat` — 노란 안전모 + 이마 램프 · 만드는 중 패널 · 작업 책상(stations)
  - 돈 든 고양이 `@hav/ui/three/money-cat` — ₩ 금화를 안음 · 직구 계산기
- 표정 규칙(기록 → 표정)은 그대로 · 화면 읽기 문장만 고양이로
- `/design` 에 캐릭터 칸 (표정을 버튼으로 바꿔 봄)

## 애매한 곳
- 렉돌 품종 · 무늬 A (확인됨: "렉돌 품종으로" · "색갈은 A")
- 작업복 · 작업모자 중 노란 안전모 (가정 · 사용자: "둘중 한가지" — 작게 보여도 잘 보이는 쪽)
- 돈 = ₩ 금화 (가정 · 사용자: "돈을 들고 있는거로")
- 머지까지 에이전트가 (가정 · 지금까지 하던 대로)

## 파일 계획
- packages/ui/src/three/**
- apps/web/src/shared/three-lazy.tsx
- apps/web/src/features/log/**
- apps/web/src/features/import-calc/**
- apps/web/src/app/design/**
- docs/design.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 표정 15개를 헤드리스 크롬으로 찍어 확인 (`.tmp/cat-shots.mjs`) · 만드는 중 패널 · 책상 · 계산기 화면
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영 확인

## 허점
- 처음엔 얼굴 가면이 머리 구 안에 묻혀 안 보였음 → 앞으로 꺼내고 눈 · 코 · 입을 그 앞으로 (찍어서 확인)
- 앱 미리보기 창이 숨겨지면 IntersectionObserver 가 오지 않아 3D 가 안 뜸 → 헤드리스 크롬(puppeteer-core)으로 찍어 확인하는 스크립트를 .tmp 에 만듦
