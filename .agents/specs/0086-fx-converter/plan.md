# 계획

## 무엇을 · 왜
- 통화 상세에 환율 계산기 — 여행 전 "10만 원이면 엔으로 얼마" 를 바로 (지금은 "환산 예시" 한 줄뿐)
  - 원 · 외화 어느 칸에 써도 반대쪽이 바뀜 · 빠른 금액 단추(원 1만 ~ 50만 · 외화는 고시 단위에 맞춰)
  - 매매기준율 + 기준일 · 출처 (FX-01) · 수출입은행 송금 환율(tts · ttb)이 있으면 "송금으로 바꾸면 약 …" (없으면 안 보여 줌)
  - 브라우저 안에서만 계산 · 보내지 않음 (FX-06 새로)
- 사용자가 고르라고 맡긴 "더 쓸 만한 기능" 첫 번째 (가정: 여행 · 직구 사용자가 가장 자주 쓸 것)

## 애매한 곳
- 위치: 오늘 환율 · 신호 바로 아래 (가정)

## 파일 계획
- apps/web/src/features/currencies/convert.ts
- apps/web/src/features/currencies/convert.test.ts
- apps/web/src/features/currencies/converter.tsx
- apps/web/src/features/currencies/currency-detail.tsx
- docs/domain/fx.md
- .agents/specs/0086-fx-converter/**

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [x] 로컬 빌드 화면 (1280 엔 · 375 달러): 원 10만 → 11,808엔 · 74.83달러 · 틀린 입력 안내 · 가로 넘침 0

## 허점
- 없음
