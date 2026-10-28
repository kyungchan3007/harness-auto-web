# 계획

## 무엇을 · 왜
- 템플릿 그대로인 하네스를 이 프로젝트(환율 · 물가 기반 여행 · 직구 타이밍 대시보드)에 맞춘다 — 이후 작업이 기준으로 삼을 규칙 · 구조 · 페이지 요구를 먼저 고정하려고
- AGENTS.md 한 줄 소개 + 고유 규칙 2개 · protected.txt 배포 설정 · docs/architecture.md · docs/domain/ 페이지별 요구 · 템플릿 원본용 파일 정리

## 애매한 곳
- 보호 파일 승인 방식: 필요할 때 사용자에게 요청 · 승인은 사용자가 (확인됨: "필요하면 나한테 승인해달라고해")
- 보호 파일 2개(AGENTS.md · .agents/protected.txt) 승인: 2026-10-28 채팅 승인 (확인됨: "승인") — 에이전트가 ALLOW_PROTECTED=1 로 대신 실행
- 템플릿 원본용 파일: 이 프로젝트에 맞게 (확인됨: 이 프로젝트에 맞게) → CHANGELOG · CONTRIBUTING 삭제 · 이슈 폼 유지 · LICENSE 유지 (가정)
- 밖 쓰기 차단 훅 ↔ 메모리 폴더: 훅은 그대로, 템플릿에 이슈로 (가정 — 사용자 답 없음, 추천안)
- checks.sh: 바꾸지 않음 — package.json 스크립트가 생기면 자동 연결되므로 Next.js 세팅 작업에서 스크립트 추가 (가정)
- 배포 방식: Next.js 정적 내보내기(`output: 'export'`) → Cloudflare Pages (가정)
- 여행지 물가 데이터 출처 · 관부가세 기준값 출처: 미정 → docs/domain 에 "확인 필요"로 표시
- Quick Loop 유지: 바뀌는 파일이 10개를 넘지만 문서 · 설정만이고 코드 · 경계 변경 없음 (가정)

## 파일 계획
- AGENTS.md
- .agents/protected.txt
- docs/architecture.md
- docs/domain/**
- README.md
- package.json
- CHANGELOG.md
- CONTRIBUTING.md
- .github/ISSUE_TEMPLATE/**
- HANDOFF.md
- .gitignore

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS (보호 파일은 사용자 승인 후 ALLOW_PROTECTED=1)
- [ ] AGENTS.md 50줄 이내 · 한 줄 소개 · 고유 규칙 2개
- [ ] docs/domain/ 에 기능 4개 + "만드는 중" 페이지 요구, 불변식 ID 부여
- [ ] 템플릿 소개 문구가 README 에 남지 않음

## 허점
- 밖 쓰기 차단 훅이 Claude Code 메모리 폴더(`~/.claude/projects/.../memory/`) Write 를 막음 — 메모리 기능과 충돌
- 같은 폴더에 Bash `sed -i` 는 훅을 통과 — `sed` 가 쓰기 명령 목록(WRITE_CMDS)에 없음
- request.md 원문을 인용(`> `)으로 적으면 spec-check 가 안내문으로 보고 "비어 있음" 판정 — 원문을 인용으로 붙이는 건 흔한 습관이라 반복될 수 있음
- 보호 파일 승인이 저장되지 않음: ALLOW_PROTECTED=1 로 통과 · 커밋한 뒤에도 Stop 훅이 같은 변경을 다시 실패 처리 (머지 · PR 라벨 전까지)
- 밖 쓰기 훅 오탐: `sed -i '' 's/^> //' 파일` 의 따옴표 안 `>` 를 리다이렉션으로 읽어 `//'` 를 밖 쓰기로 차단
