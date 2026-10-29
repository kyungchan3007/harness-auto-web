# 계획

## 무엇을 · 왜
- 여행지 물가 비교 페이지 `/prices` (이슈 #8 · docs/domain/travel-price.md TRV)
- API `GET /prices/levels?base=KOR` 는 이미 있음 → 빌드 때 받아 정적 페이지로
- 인기 여행지 나라만 한국어 이름 · 국기로 "한국보다 싼 편 · 비슷 · 비싼 편" 묶음 + 막대
- 나라마다 기준 연도 · 출처 (TRV-01) · 그 나라 통화가 환율 표에 있으면 오늘 환율 신호도 옆에 (숫자를 섞지 않고 나란히만)

## 애매한 곳
- 묶음 경계: 한국 대비 0.9 미만 싼 편 · 1.1 초과 비싼 편 · 그 사이 비슷 (가정 · 세계은행 안내대로 정밀 순위 대신 묶음)
- 나라 목록: 한국인 여행이 많은 나라 위주로 고정 표 (가정) · 표에 있어도 자료가 없으면 빠짐 (TRV-02)
- 체감 물가(물가 × 오늘 환율) 숫자는 만들지 않음 — 두 값을 합친 근거가 약함 (가정)
- 디자인: 통화 · 계산기 페이지와 같은 밝은 섹션 · 카드 · 막대 (사용자가 "묻지 말고 알아서" 라고 함)

## 파일 계획
- packages/shared/src/travel.ts
- packages/shared/src/travel.test.ts
- packages/shared/package.json
- apps/web/src/app/prices/**
- apps/web/src/features/travel-price/**
- apps/web/src/shared/site-nav.tsx
- apps/web/src/features/currencies/currency-detail.tsx
- docs/domain/travel-price.md
- docs/design.md
- .agents/specs/0068-travel-price/**

## 계획 밖 변경 이유
- packages/ui/src/components/nav-bar.tsx — 메뉴에 "여행 물가" 가 늘어 휴대폰에서 끝 글자가 잘려 보임 → 오른쪽 끝을 흐리게

## 완료 기준
- [x] bash .agents/checks.sh PASS
- [x] /prices 정적 페이지 · 모바일 가로 넘침 없음 · 자료 없을 때 "자료 없음"
- [ ] 배포 뒤 tripfx.pages.dev/prices 확인

## 허점
- 파일 계획을 한 줄에 " · " 로 여러 개 적었더니 게이트가 한 경로로 읽어 전부 계획 밖 경고 — 한 줄에 하나씩
- 바뀐 파일 13개로 Quick 기준(10)을 넘음 — 새 페이지 하나라 설계 고민은 적어 Quick 유지 (공용 함수 · 테스트 · 문서가 늘어난 것)
