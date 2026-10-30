# 계획

## 무엇을 · 왜
- 통화 페이지마다 설명 글(검색 결과 · 공유 미리보기 밑글) — 전엔 제목만 있고 설명은 사이트 공통 글
  - "엔화(JPY) 2026-10-29 기준 846.89원 / 100 · 최근 90일 중 싼 편 (예측 아님) · …" — 기준일을 꼭 같이 (미리보기는 캐시돼 오래 남음 · FX-01)
  - 대표 주소(canonical) `/currencies/JPY`
- 통화 상세에 공유 단추 — 휴대폰은 공유 창 · 안 되면 주소 복사 (보내는 곳 없음 · 브라우저 기능만)

## 애매한 곳
- 없음

## 파일 계획
- apps/web/src/features/currencies/describe.ts
- apps/web/src/features/currencies/describe.test.ts
- apps/web/src/features/currencies/share-button.tsx
- apps/web/src/features/currencies/currency-detail.tsx
- apps/web/src/app/currencies/**
- .agents/specs/0093-currency-share/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드: JPY.html description · canonical · 공유 창 없는 브라우저에서 주소 복사 · 1280 · 375 화면

## 허점
- 없음
