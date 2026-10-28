# 계획

## 무엇을 · 왜
- `packages/shared`(@hav/shared): API 요청 · 응답 zod 스키마 한 곳 (date · fx · signal · prices · errors) — 화면도 같은 스키마로 응답을 검사할 수 있게
- API 의 손으로 짠 검사(통화 코드 정규식 2곳 · 날짜 함수)를 `validate()`(zValidator 감싼 것) 로 · 검사 실패 400 은 `ApiError` 한 가지 모양
- 응답을 공용 스키마 타입으로 돌려줌 (`const body: FxLatest = …`)
- 외부 API 응답(수출입은행 · Frankfurter · 세계은행)도 zod 로 읽음 — 모양이 바뀌면 분명한 오류

## 애매한 곳
- zod 로 (확인됨: "api는 zod 사용하도록 지저분한거 싫으니까")
- 화면 쪽 호출은 Hono RPC(`hc`) 대신 fetch + 공용 zod 스키마 검사로 할 예정 — 런타임에도 검사되고 화면이 API 코드에 묶이지 않음 (가정 · 다음 작업에서 architecture.md 갱신)
- 응답은 서버에서 다시 parse 하지 않고 타입으로만 맞춤 — 값은 DB 에서 오고 스키마 검사는 받는 쪽(화면)이 함 (가정)
- 통화 · 나라 코드는 소문자도 받아 대문자로 (가정)

## 파일 계획
- packages/shared/**
- apps/api/**
- package.json
- package-lock.json

## 계획 밖 변경 이유

## 완료 기준
- [x] 공용 스키마 테스트 7개 · API 테스트 43개 (검사 실패 응답 모양 테스트 추가)
- [x] API 안에 요청 검사용 정규식 0개 (외부 응답 읽기용 1개만 zod 안으로)
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- 작업 기록(request · plan)을 먼저 쓰지 않고 코드부터 씀 → 게이트가 "작업 기록 비어 있음 · 계획 밖 21개"로 잡음. 순서는 기록 먼저
- npm workspaces 에서 dependencies 가 빠지는 문제 **3번째** (0017 · 0019 · 0033) — 처음에 빈 `"dependencies": {}` 를 써 둔 패키지에서 `-D` 설치 뒤 빠짐. **반복됨 → 규칙 후보**: 새 패키지 package.json 에 빈 dependencies 를 쓰지 말 것 · 설치 뒤 확인
