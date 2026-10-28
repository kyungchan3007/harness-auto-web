# 계획

## 무엇을 · 왜
- 배포를 마친 상태를 HANDOFF 에 기록 (사이트 · API · D1 · 비밀값 · 데이터 · 도메인)
- `wrangler.jsonc` 에 `workers_dev: true` · `preview_urls: false` 명시 (배포 때 "기본값으로 켰다" 경고)
- `docs/design.md`: 홈 흐름 · 지구본 · 애니메이션 원칙 추가 · 가정 3개 확정
- #10(배포 · 미리보기)은 Pages ↔ GitHub 연결로 끝나서 닫음

## 애매한 곳
- 홈 흐름 (확인됨: "이대로 가면될거 같아")
- 가정 3개 확정 (확인됨: "오케이 시작해" — 에이전트가 "셋 다 그대로라고 해 주시면 시작"이라고 물은 뒤의 답)
- 버전별 미리보기 주소(preview_urls)는 끔 — 쓰지 않음 (가정)
- 보호 파일(wrangler.jsonc) 승인: 에이전트 (확인됨: "라벨도 네가 붙여")

## 파일 계획
- HANDOFF.md
- apps/api/wrangler.jsonc
- docs/design.md

## 계획 밖 변경 이유

## 완료 기준
- [ ] bash .agents/checks.sh PASS
- [ ] CI 통과 · 머지 · #10 닫힘

## 허점
-
