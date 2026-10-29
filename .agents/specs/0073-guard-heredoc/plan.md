# 계획

## 무엇을 · 왜
- 작업 폴더 밖 쓰기 훅(outside-guard)이 heredoc 본문 글자 속 `>/경로` 를 쓰기 대상으로 읽어 작업 0068 · 0069 에서 두 번 막음 (같은 허점 두 번 → 하네스로 막는다)
- heredoc 본문만 빼고 검사 · 첫 줄(`cat > f <<'EOF'`)의 리다이렉션과 heredoc 뒤 명령은 그대로 검사
- 보호 파일(.agents/scripts/**) — 사용자 승인 "둘 다 승인" (위 원문)

## 애매한 곳
- 끝 표시(EOF)가 없는 heredoc 은 건드리지 않음 → 예전처럼 전부 검사 (안전한 쪽)

## 파일 계획
- .agents/scripts/outside-guard.mjs
- .agents/scripts/harness.test.mjs
- .agents/specs/0073-guard-heredoc/**

## 계획 밖 변경 이유

## 완료 기준
- [x] ALLOW_PROTECTED=1 bash .agents/checks.sh PASS
- [x] 테스트: 본문 속 글자는 통과 · 첫 줄 밖 경로 · heredoc 뒤 밖 경로는 막음

## 허점
-
