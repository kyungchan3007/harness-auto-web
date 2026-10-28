# 계획

## 무엇을 · 왜 (1/4 — 뒤쪽 · 순서: 기록 API → SSR·BFF → 만드는 중 페이지 → 🧳 캐릭터)
- 에이전트가 도구를 쓸 때마다 짧은 기록을 API 로 보내고, "만드는 중" 페이지가 몇 초마다 읽는다 (SSR·BFF · 페이지 · 캐릭터는 다음 PR)
- `.agents/scripts/activity.mjs`: **거르는 규칙** — 도구 → 종류 · 고정된 한국어 문장 · 파일 **이름만** · 작업 번호 · 결과(통과/실패/막힘)만. 명령어 · 파일 내용 · 도구 결과 글은 **보내지 않음**
- 훅: PreToolUse(밖 쓰기 훅이 막을 일이면 🛑 기록) · PostToolUse(종류 · 결과) — 보내다 실패해도 작업은 막지 않음 (항상 exit 0 · 1.5초 제한)
- API `apps/api/src/features/activity/`: `POST /activity` (토큰 `ACTIVITY_TOKEN`) · `GET /activity` (공개) · D1 `activity_events` · 최근 500개만 남김 · CORS 없음 (페이지는 BFF 를 거쳐 읽음)
- `docs/design.md`: 만드는 중 페이지 흐름 · 🧳 캐릭터 · **디자인 시스템 규칙(두 곳 이상 → packages/ui · three.js 도)** · 3D 성능 기준
- `docs/architecture.md`: SSR · BFF 전환 계획

## 애매한 곳
- 실시간 공개 · 만드는 중 탭 · 스크롤 장면 · 3D 캐릭터 (확인됨: 원문)
- 로봇 대신 귀여운 캐릭터 · 재밌게 (확인됨: "로보 말구 귀여운 캐릭터로") — 이미 정한 🧳 가방 캐릭터를 씀 (가정)
- 3D 성능 확인 · SSR BFF (확인됨: "성능도 확인해야해 SSR BFF할수 있으면 진행하고") — OpenNext + 서비스 바인딩, 다음 PR (가정)
- 두 곳 이상 쓰면 디자인 시스템으로 · three.js 도 (확인됨: 원문)
- 파일 경로는 이름만 · 기록은 터미널 느낌 · 블록 탑 나중 · 쉬는 중 표시 · 이름 없음 (확인됨: "응 좋아 시작해줘" — 추천안)
- 명령은 내용 대신 **모양으로 분류**(테스트 · 게이트 · 빌드 · 커밋 · PR · 설치 · 그 밖) — 명령 글에 비밀값이 섞일 수 있어서 (가정)
- 파일 이름도 비밀 모양(`.env` · `.dev.vars` · 긴 hex · 토큰 접두사)이면 "비밀 파일"로 바꿈 (가정)
- 토큰은 사람이 만들어 Worker 비밀값 + 로컬 파일(`.tmp/activity-token`, 커밋 제외)에 (가정)
- 기록 보내는 곳은 배포한 API 고정 · 환경 변수 `TRIPFX_ACTIVITY_URL` 로 바꿀 수 있음 (가정)
- 보호 파일(.claude/settings.json · .agents/scripts/** · DB 스키마 · 마이그레이션) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- .agents/scripts/activity.mjs
- .agents/scripts/harness.test.mjs
- .claude/settings.json
- apps/api/**
- packages/shared/**
- docs/design.md
- docs/architecture.md
- package.json

## 계획 밖 변경 이유

## 완료 기준
- [x] 거르는 규칙 테스트 (harness.test.mjs 4개): 명령 · 내용이 안 나감 · 비밀 모양 파일 · 토큰 모양 글 · 종류 분류 · 밖 쓰기 막힘
- [x] API 테스트: 토큰 없음 404 · 틀림 401 · 관리 토큰으론 못 씀 · 모양 검사 (activity.test.ts) · 500개만 남김은 로컬 D1 로 확인 (505개 보냄 → 500개 · 가장 오래된 id 9)
- [x] 로컬에서 훅 → API → GET 로 실제 기록 확인 (수정 · 게이트 통과 · 🛑 막음 3개 · 수정 내용 글은 안 나감)
- [ ] bash .agents/checks.sh PASS · CI · 머지 · 자동 배포

## 허점
- Stop 훅(게이트 · 한국어 검사)이 멈춘 것은 아직 기록 안 됨 — 다음에
- 출력을 리다이렉션하면(> .tmp/gate.log) 통과/실패를 모름 → ok 비움
