# 계획

## 무엇을 · 왜
- 지구본을 실제 지구로 — NASA Visible Earth "Blue Marble" (world.topo.bathy.200412 · 퍼블릭 도메인 · https://visibleearth.nasa.gov/images/73909)
  - 원본 5400×2700 (2.6MB) → 2048×1024 JPEG (약 350KB) `apps/web/public/textures/earth-2048.jpg`
  - `Globe` 에 `texture` 주소를 받음 (디자인 시스템은 파일 위치를 모름) · 받기 전 · 못 받으면 예전 어두운 구 + 위경도선
  - 사진은 조금 어둡게(색 곱하기) — 호 · 점이 묻히지 않게 · 사진이 있으면 위경도선은 뺌
- 잘림: fov 는 세로 기준이라 칸이 좁으면(넓은 화면 두 칸 · 1024px 등) 가로 시야가 줄어 양옆이 잘렸음
  - 칸 비율로 카메라 거리를 다시 잼 (`fitDistance` · geo.ts) — 넓은 칸은 지금 거리 그대로 · 좁을 때만 물림

## 애매한 곳
- 사진 밝기: 색 #b8c0cc 를 곱함 (가정 · 어두운 화면에 맞춤)

## 파일 계획
- packages/ui/src/three/globe.tsx
- packages/ui/src/three/geo.ts
- packages/ui/src/three/geo.test.ts
- apps/web/public/textures/earth-2048.jpg
- apps/web/src/features/home/places.ts
- apps/web/src/features/home/home.tsx
- apps/web/src/features/home/trip-scenes.tsx
- docs/design.md
- .agents/specs/0085-real-globe/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면: 375 · 1024 · 1280 · 1600 폭 모두 지구가 안 잘림 · 실제 지구 · 서울 → 도쿄 호가 한반도 · 일본 위
- [ ] 운영 화면 확인

## 허점
- 같은 재질에 사진(map)만 나중에 넣으면 셰이더를 다시 안 만들어 회색 구만 나옴 — key 로 재질을 새로 만듦 (화면으로 확인해서 잡음)
