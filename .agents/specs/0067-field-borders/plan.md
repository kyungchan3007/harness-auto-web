# 계획

## 무엇을 · 왜 (2배로 찍어 봄)
- 통화 목록: 칸 테두리를 칸 밖(ring)에 그려서 스크롤 영역 끝에서 선택된 엔화 위쪽이 잘림 · 카드만큼 크게 둥글어 곡선 테두리가 흐려 보임 · 지역 버튼 "오세아니아" 가 잘림
- 계산기: 입력 칸이 알약 모양 · 선택 상자 화살표가 브라우저 기본이라 칸마다 모양이 다름
- 고침
  - 디자인 시스템 `@hav/ui/field` (Input · Select) — 칸 안쪽 border 1px · 모서리 radius-field(14px · 새 토큰) · 높이 48px · 같은 화살표 → 찾기 칸 · 계산기가 같이 씀
  - 통화 목록 칸: border · radius-field · 스크롤 영역 안쪽 여백 · 넓은 화면은 지역 버튼 줄바꿈

## 애매한 곳
- 정리 범위 (확인됨: 통화 · 직구계산 · 테두리)
- 모서리 14px (가정 · 카드 28px 보다 작게)

## 파일 계획
- packages/ui/src/components/field.tsx
- packages/ui/src/tokens.css
- apps/web/src/features/currencies/currency-list.tsx
- apps/web/src/features/import-calc/calc-form.tsx
- docs/design.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 운영 · 로컬을 2배로 찍어 비교 (넓은 화면 · 휴대폰) — 엔화 위 테두리 안 잘림 · 칸마다 같은 테두리
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영 확인

## 허점
- 1배 화면 캡처로만 봐서 1px 테두리 잘림을 못 봤음 → 테두리 확인은 2배로 찍는 스크립트(`.tmp/ui-shots.mjs`)
