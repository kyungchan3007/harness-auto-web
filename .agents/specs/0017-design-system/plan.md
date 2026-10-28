# 계획

## 무엇을 · 왜
- `packages/ui`(@hav/ui): `docs/design.md` 결정을 값으로 — 토큰(Tailwind v4 CSS 변수) · Base UI 위 기본 부품 · 패턴
- 색 대비를 문서가 아니라 **테스트로** 고정 — 토큰 값을 바꾸면 게이트가 다시 잼
- `apps/web/design` 확인용 화면 · 3D(three.js)는 범위 밖 (별도 이슈)

## 애매한 곳
- 헤드리스 Base UI · Tailwind v4 (확인됨: "Base UI + Tailwind v4로 가도 될까요?" → "오케이 시작")
- 배경 3종 `data-surface="dark | elevated | light"` 로 섹션마다 색이 함께 바뀜 (가정)
- 밝은 배경 포인트 `#0B9C8E` → `#08756B` · 오로라 끝 `#D0479E` → `#B8327F` — 실측 대비 3.13 · 3.80 로 기준 미달이라 교체 (가정 — docs/design.md "토큰 때 대비 측정" 에 따름)
- 신호 밝은 배경 값 `#1F63D6` · `#6E6E73` · `#D7263D` (가정)
- 대비 기준: 본문 · 포인트 · 신호 4.5 · 오로라(큰 글자 전용) 3 — WCAG AA (가정)
- Pretendard 1.3.9 npm 자체 호스팅 (외부 CDN 안 씀) (가정)
- 패키지 진입점: 부품마다 `@hav/ui/<이름>` (Turborepo 권장: 전체 다시 내보내는 barrel 지양)
- `transpilePackages: ["@hav/ui"]` — TS 소스를 그대로 쓰는 내부 패키지 (보호 파일 next.config · 에이전트 승인)
- `.claude/launch.json`: 앱의 미리보기 서버 실행기가 `Documents` 폴더 권한이 없어 직접 띄운 서버에 붙는 설정 (가정)

## 파일 계획
- packages/ui/**
- apps/web/**
- package.json
- package-lock.json
- .claude/launch.json
- docs/design.md
- HANDOFF.md

## 계획 밖 변경 이유

## 완료 기준
- [x] 대비 테스트 60개 통과 · 일부러 기준 미달 색(`#0B9C8E`)을 넣으면 3개 실패 (테스트가 실제로 잡는지 확인)
- [x] typecheck · lint · test · build 통과 · `out/design.html` 생성
- [x] 브라우저에서 직접 확인: 오로라 · Pretendard · 카드 · 밝은 섹션 · 탭 전환 · 툴팁 표시
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지

## 허점
- 앱 미리보기 실행기(launch.json)가 `~/Documents` 아래 폴더를 읽지 못함 (getcwd Operation not permitted) — 서버를 셸에서 직접 띄워 붙임
- 툴팁이 첫 화면 캡처에 안 보여 "안 된다"고 오판할 뻔 — 상태(data-open · 위치)를 직접 읽고 확대 캡처로 확인
- 기억에 기대지 않으려고 Base UI 부품 구조 · 상태 속성(`data-active` · `--active-tab-left`)을 패키지 안 문서로 확인
