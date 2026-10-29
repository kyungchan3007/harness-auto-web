# 계획

## 무엇을 · 왜
- 통화 둘러보기 페이지 `/currencies` · `/currencies/[code]` (시안 1 그대로)
  - 통화마다 정적 페이지 (빌드 때 API 의 통화 전부 · FX-03) · `/currencies` 는 달러를 보여 줌
  - 왼쪽 목록: 찾기(이름 · 코드) · 지역 · 신호 글자 · 지금 통화 표시 → 누르면 그 통화 주소로
  - 오른쪽 상세: 🪙 3D 동전 · 오늘 환율 · 기준일 · 출처 · 신호 · 1년 흐름 선 그래프 · 1년 최저 · 최고 · 100 단위 환산 · 직구 계산기 링크(다음 작업 0059 에서 생김)
- 두 곳 이상에서 쓰게 되는 것 옮김 (디자인 시스템 규칙)
  - 국기 → `@hav/ui/flag` (나라 코드만 받음 · 통화는 모름)
  - 통화 이름 · 지역 표 · 환율 글자 · 신호 문장 → `@hav/shared/currency` (화면 없는 순수 함수 · 테스트 같이)
  - 🪙 동전 → `@hav/ui/three/coin` (기호 · 신호 색만 받음)
- 상단 메뉴 "통화" → `/currencies`

## 애매한 곳
- 시안 그대로 (확인됨: "이대로 시작")
- 1년 그래프는 SVG 2D (3D 리본은 나중 · 성능) (가정)
- 직구 계산기 링크는 계산기 작업(다음)에서 넣음 — 지금 넣으면 머지 사이에 빈 주소 (가정)
- 빌드 때 API 가 안 되면 달러 페이지 하나만 만들고 "자료 없음" (가정 · 숫자 지어내지 않음 FX-02)
- Quick Loop 로 함 — 바뀐 파일 34개 중 옮기기 · 삭제가 12개 · 새 경계 없음 (가정 · 게이트가 Full 검토 경고)

## 파일 계획
- packages/shared/src/currency.ts
- packages/shared/src/currency.test.ts
- packages/shared/package.json
- packages/ui/src/components/flag.tsx
- packages/ui/src/three/coin.tsx
- packages/ui/package.json
- apps/web/src/features/currencies/**
- apps/web/src/features/home/**
- apps/web/src/app/currencies/**
- apps/web/src/shared/**
- apps/web/package.json
- package-lock.json
- docs/design.md
- docs/domain/fx.md

## 계획 밖 변경 이유
- package-lock.json (보호 파일) — country-flag-icons 를 apps/web → packages/ui 로 옮겨 잠금 파일의 소속만 바뀜 · 새 패키지 없음 · harness-approved 라벨로 승인 (에이전트 권한 · 사용자 위임)

## 완료 기준
- [x] currency 순수 함수 테스트 (옮긴 테스트 + 1년 최저 · 최고 · 그래프 점)
- [x] 로컬 빌드에 통화 수만큼 페이지 · 목록 누르면 통화가 바뀌고 동전이 뒤집힘 · 휴대폰 폭
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 운영 확인

## 허점
- 엔 1년 그래프가 두 날 바닥으로 떨어짐 — 예비 출처(Frankfurter)는 엔도 1 단위로 저장돼 있었음 → `toUnit` 으로 화면 단위에 맞춤 (테스트) · 저장 단위를 맞출지는 나중 (API)
- 동전 기호가 옆으로 · 거꾸로 — 원기둥 윗면 UV 방향 · 화면으로 두 번 확인해 +90°
- 로컬 정적 서버는 주소에 .html 이 붙어 동전이 달러로 나옴 → 주소 읽기에 .html 허용 (테스트)
- 휴대폰 폭에서 목록 가로 줄 때문에 페이지가 가로로 넘침 → 격자 칸에 minmax(0,1fr) · min-w-0
- 휴대폰 폭 에뮬레이션에서 3D 캔버스가 스크롤 전엔 크기를 못 잡음 (만드는 중 페이지도 같음 · 이번 변경 전부터) → 성능 작업에서 실제 휴대폰으로 확인
