# 계획

## 무엇을 · 왜
- 통화 목록에 즐겨찾기(☆ → ★) — 22개 통화 중 자주 보는 몇 개를 매번 찾지 않게
  - 즐겨찾기는 목록 맨 위 (고른 순서) · "★ 즐겨찾기 N" 묶음 칩
  - 이 브라우저에만 저장(localStorage `tripfx:favorites`) · 보내지 않음 · 저장소를 못 쓰면 빈 목록으로 그냥 동작
  - 저장된 값은 모양 검사 (3글자 대문자 · 최대 20개) — 이상한 값은 버림
  - 같은 탭 · 다른 탭 모두 바로 반영 (useSyncExternalStore · storage 이벤트) · 빌드 그림은 빈 목록이라 하이드레이션 어긋남 없음

## 애매한 곳
- 별 위치: 각 줄 오른쪽 (가정)

## 파일 계획
- apps/web/src/features/currencies/favorites.ts
- apps/web/src/features/currencies/favorites.test.ts
- apps/web/src/features/currencies/currency-list.tsx
- .agents/specs/0089-favorite-currencies/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면 1280 · 375: ★ 두 개 → 맨 위 · 새로 고침 뒤 유지 · 빼면 제자리 · 페이지 오류 0 · 가로 넘침 0

## 허점
- 없음
