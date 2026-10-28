# 계획

## 무엇을 · 왜
- `apps/web/src/shared/api.ts`: 빌드 때 API 를 부르고 `@hav/shared` zod 스키마로 응답 검사 — 결과는 `{ ok: true, data } | { ok: false, reason }`
- API 가 죽거나 모양이 다르면 빌드는 그대로 · 화면은 "자료 없음" + 이유 (FX-02: 숫자를 지어내지 않음)
- API 주소 기본값 `https://tripfx-api.developfff.workers.dev` · 환경 변수 `TRIPFX_API_URL` 로 바꿀 수 있음
- 화면(홈)은 다음 작업 — 이번엔 받는 길과 테스트만

## 애매한 곳
- 빌드 때 받음 · 실패해도 빌드는 성공 (확인됨: 에이전트 제안 2번에 "오케이 시작해")
- 응답 검사는 zod (확인됨: "api는 zod 사용하도록")
- Hono RPC 대신 fetch + 공용 스키마 (가정 — 0033 plan 과 같음 · architecture.md 갱신)
- 한 번 요청 제한 시간 10초 (가정)
- 사이트는 빌드할 때의 데이터라, 매일 새 데이터를 보이려면 매일 다시 빌드해야 함 → Pages 배포 훅을 Cron 이 부르는 방식은 다음 작업 (사람이 훅 주소를 만들어야 함)

## 파일 계획
- apps/web/src/shared/**
- apps/web/package.json
- package-lock.json
- docs/architecture.md
- apps/api/src/features/prices/**

## 계획 밖 변경 이유
- apps/api/src/features/prices — 실제 배포 API 를 화면 스키마로 받아 보니 짐바브웨 물가 수준 0.0003 (한국 대비 0) 이 나와 검사 실패. PPP 와 환율의 통화 단위가 어긋난 원본 오류라 0.05 ~ 5 밖은 수집 · 읽기에서 뺌 (TRV-02)

## 완료 기준
- [x] 테스트: 정상 응답 · 모양 다름 · HTTP 오류 · 연결 실패 · 시간 초과 · 주소 (5개)
- [ ] 실제 배포 API 로 한 번 받아 검사 통과 — 환율 · 신호는 통과 · 물가는 원본 오류로 실패 → API 고침 · **다시 배포해야 통과**
- [x] bash .agents/checks.sh PASS · build 통과
- [ ] CI 통과 · 머지

## 허점
- 세계은행 원본에 통화 단위가 어긋난 값(짐바브웨 0.0003 · 라이베리아 0.0026)이 있었는데 0022 에서 못 봄 — 숫자 범위 검사가 없었음. 화면 쪽 zod 스키마(relative > 0)가 처음 잡음
