// 하네스 스크립트 테스트 — node --test .agents/scripts/
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSpec, globToRegExp, isTestFile, matchesAny, planSection } from "./lib.mjs";
import { protectedHits } from "./protected-check.mjs";
import { outOfPlan, removedAssertions } from "./scope-check.mjs";
import { emptyTemplate } from "./spec-check.mjs";
import { decide, isOutside, writeTargets } from "./outside-guard.mjs";
import { englishReason, lastTurnTexts } from "./korean-gate.mjs";
import { classifyBash, resultOf, safeFile, stripText, taskFor, toActivity } from "./activity.mjs";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as pathJoin } from "node:path";

test("glob: ** · * · 폴더", () => {
  assert.ok(globToRegExp("src/cart/**").test("src/cart/a/b.ts"));
  assert.ok(globToRegExp("**/*.test.ts").test("src/a.test.ts"));
  assert.ok(globToRegExp("**/*.test.ts").test("a.test.ts"));
  assert.ok(!globToRegExp("src/*.ts").test("src/a/b.ts"));
  assert.ok(globToRegExp("docs/").test("docs/x.md"));
  assert.ok(matchesAny("AGENTS.md", ["AGENTS.md"]));
});

test("보호 파일: 목록에 걸린 것만", () => {
  assert.deepEqual(protectedHits(["src/a.ts", ".agents/checks.sh", "pnpm-lock.yaml"], [".agents/checks.sh", "pnpm-lock.yaml"]), [".agents/checks.sh", "pnpm-lock.yaml"]);
});

test("plan.md 섹션: 주석 · 빈 불릿 · 체크박스 제외, 백틱 제거", () => {
  const plan = "## 파일 계획\n<!-- 설명 -->\n- `src/cart/**`\n- \n- [ ] 이건 아님\n## 계획 밖 변경 이유\n- src/ui/Button.tsx — 공용 버튼 색 버그\n";
  assert.deepEqual(planSection(plan, "파일 계획"), ["src/cart/**"]);
  assert.deepEqual(planSection(plan, "계획 밖 변경 이유"), ["src/ui/Button.tsx — 공용 버튼 색 버그"]);
});

test("범위: 계획 · specs · 이유 적힌 파일은 통과, 나머지는 경고", () => {
  const files = ["src/cart/qty.ts", "src/ui/Button.tsx", "src/ui/Card.tsx", ".agents/specs/0001-x/plan.md"];
  assert.deepEqual(outOfPlan(files, ["src/cart/**"], ["src/ui/Button.tsx — 이유"]), ["src/ui/Card.tsx"]);
});

test("테스트 약화: 지워진 단언 줄만 센다", () => {
  const diff = "--- a/x.test.ts\n+++ b/x.test.ts\n-  expect(a).toBe(1)\n+  expect(a).toBe(2)\n-  const y = 1\n";
  assert.equal(removedAssertions(diff), 1);
  assert.ok(isTestFile("src/a.test.ts") && isTestFile("tests/a.ts") && !isTestFile("src/a.ts"));
});

test("작업 기록: 템플릿 그대로면 빈 것", () => {
  assert.ok(emptyTemplate("# 요청 원문\n\n<!-- 붙여 넣기 -->\n"));
  assert.ok(emptyTemplate("# 계획\n## 무엇을\n-\n- [ ] \n"));
  assert.ok(!emptyTemplate("# 요청 원문\n장바구니 수량 버그 고쳐 줘\n"));
});

test("밖 쓰기: 쓰기 대상만 뽑는다", () => {
  assert.deepEqual(writeTargets("bash x.sh > $HOME/.out 2>&1"), ["$HOME/.out"]);
  assert.deepEqual(writeTargets("cmd | tee -a /tmp/log && rm -f /tmp/a"), ["/tmp/log", "/tmp/a"]);
  assert.deepEqual(writeTargets("cp src/a.ts /tmp/b.ts"), ["/tmp/b.ts"]);
  assert.deepEqual(writeTargets("cat /etc/hosts && echo hi 2>/dev/null"), []); // 2> 는 표준 에러 리다이렉션, /dev 는 어차피 허용
});

test("밖 쓰기: 프로젝트 안 · /dev 는 허용, 밖은 차단", () => {
  const root = "/work/app";
  assert.ok(!isOutside("src/a.ts", root));
  assert.ok(!isOutside(".tmp/log", root));
  assert.ok(!isOutside("/dev/null", root));
  assert.ok(isOutside("/tmp/log", root));
  assert.ok(isOutside("../other/x", root));
  assert.ok(isOutside("~/x", root));
  // heredoc 본문 속 글자는 쓰기 대상이 아님 · 첫 줄의 리다이렉션은 그대로 검사
  assert.equal(decide({ tool_name: "Bash", tool_input: { command: "cat > .tmp/p.md <<'EOF'\n주석 <경로>/memory · a >/etc/x\nEOF\nls" } }, root), null);
  assert.ok(decide({ tool_name: "Bash", tool_input: { command: "cat > /tmp/p.md <<'EOF'\n안전\nEOF" } }, root));
  assert.ok(decide({ tool_name: "Bash", tool_input: { command: "cat <<EOF\nx\nEOF\necho hi > /tmp/after" } }, root));
  // 이 프로젝트의 기억 폴더만 예외 · 다른 프로젝트 기억 · 그 위 폴더는 계속 막음
  assert.ok(!isOutside("~/.claude/projects/-work-app/memory/a.md", root));
  assert.ok(isOutside("~/.claude/projects/-work-other/memory/a.md", root));
  assert.ok(isOutside("~/.claude/projects/-work-app/settings.json", root));
  assert.ok(isOutside("~/.claude/projects/-work-app/memory/../x.md", root));
  assert.ok(decide({ tool_name: "Bash", tool_input: { command: "cd /work/app && bash g.sh > /tmp/g.log" } }, root));
  assert.equal(decide({ tool_name: "Bash", tool_input: { command: "cd /work/app && bash g.sh > .tmp/g.log 2>/dev/null" } }, root), null);
  assert.ok(decide({ tool_name: "Write", tool_input: { file_path: "/Users/me/notes.md" } }, root));
  assert.equal(decide({ tool_name: "Write", tool_input: { file_path: "/work/app/src/a.ts" } }, root), null);
  assert.equal(decide({ tool_name: "Read", tool_input: { file_path: "/etc/hosts" } }, root), null);
});

// 오케스트레이션 뼈대 — 지침서마다 필수 칸이 있는지 (내용은 비어도 됨)
import { readFileSync as read, readdirSync as list } from "node:fs";
const ORCH = new URL("../orchestration/", import.meta.url);
const headings = (file) => read(new URL(file, ORCH), "utf8").split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim());
const ROLE_SECTIONS = ["목적", "먼저 읽을 것", "할 일", "하지 않을 것", "받는 것", "넘기는 것", "완료 기준"];
const PATTERN_SECTIONS = ["언제 쓰나", "참여 역할", "흐름", "단계", "전달물", "합류 · 판정", "충돌 방지", "주의"];

test("오케스트레이션: 역할 지침서 필수 칸", () => {
  for (const f of list(new URL("roles/", ORCH)).filter((f) => f.endsWith(".md"))) {
    const missing = ROLE_SECTIONS.filter((s) => !headings(`roles/${f}`).includes(s));
    assert.deepEqual(missing, [], `roles/${f} 에 빠진 칸`);
  }
});

test("오케스트레이션: 패턴 지침서 필수 칸", () => {
  for (const f of list(new URL("patterns/", ORCH)).filter((f) => f.endsWith(".md"))) {
    const missing = PATTERN_SECTIONS.filter((s) => !headings(`patterns/${f}`).includes(s));
    assert.deepEqual(missing, [], `patterns/${f} 에 빠진 칸`);
  }
});

test("오케스트레이션: 6요소 · 4패턴이 README에 연결됨", () => {
  const readme = read(new URL("README.md", ORCH), "utf8");
  for (const s of ["분해·배정", "흐름", "전달물", "상태 공유", "합류·판정", "충돌 방지", "역할 분리", "병렬 분산", "감독자-작업자", "토론"]) assert.ok(readme.includes(s), s);
});

import { requiredDocs } from "./spec-check.mjs";
test("작업 기록: 작은 작업은 plan, 큰 작업은 prd + sdd", () => {
  assert.deepEqual(requiredDocs((f) => f === "plan.md"), ["plan.md"]);
  assert.deepEqual(requiredDocs((f) => f === "prd.md"), ["prd.md", "sdd.md", "trace.md"]);
  assert.deepEqual(requiredDocs(() => false, "full"), ["prd.md", "sdd.md", "trace.md"]);
  for (const f of ["request.md", "prd.md", "sdd.md", "trace.md"]) assert.ok(emptyTemplate(read(new URL(`../specs/_template-full/${f}`, import.meta.url), "utf8")), `${f} 템플릿은 빈 것으로 판정`);
  const sdd = read(new URL("../specs/_template-full/sdd.md", import.meta.url), "utf8");
  for (const s of ["접근", "대안 · 트레이드오프", "파일 계획", "계획 밖 변경 이유", "위험", "검증 계획", "계획과 달라진 점"]) assert.ok(sdd.includes(`## ${s}`), s);
});

import { loopMode } from "./loop-mode.mjs";
test("루프: LOOP 우선, 없으면 prd·sdd 있으면 full", () => {
  assert.equal(loopMode({ env: "", has: () => false }), "quick");
  assert.equal(loopMode({ env: "", has: (f) => f === "sdd.md" }), "full");
  assert.equal(loopMode({ env: "full", has: () => false }), "full");
  assert.equal(loopMode({ env: "quick", has: (f) => f === "sdd.md" }), "quick");
});

// 실제 이 세션 대화 기록으로 잰 기준: 영어로 쓴 답 69개 모두 잡고 한국어 답 81개는 하나도 안 막음 (작업 0025)
test("한국어 게이트: 영어 답은 막고, 기술 용어 섞인 한국어 답은 통과", () => {
  assert.ok(englishReason("Now the harness files."));
  assert.ok(englishReason("While CI runs, I'm starting the second task, **monorepo conversion**."));
  assert.ok(englishReason("요약입니다.\n\nThe tooltip works too, the earlier screenshot was simply taken before it appeared."));
  assert.equal(englishReason("PR #20 을 올렸습니다. Worker · D1 · Cron · Hono 를 로컬에서 확인했습니다."), null);
  assert.equal(englishReason("`apps/api/src/index.ts` 와 [Hono Best Practices](https://hono.dev) 를 봤습니다."), null);
  assert.equal(englishReason("```bash\nnpx wrangler deploy --dry-run --outdir dist\n```\n위 명령을 실행하세요."), null);
});

test("한국어 게이트: 마지막 사람 메시지 뒤 에이전트 글만 (도구 결과는 사람 메시지가 아님)", () => {
  const line = (o) => JSON.stringify(o);
  const jsonl = [
    line({ type: "user", message: { content: "첫 질문" } }),
    line({ type: "assistant", message: { content: [{ type: "text", text: "Old English answer that was already fixed" }] } }),
    line({ type: "user", message: { content: "둘째 질문" } }),
    line({ type: "assistant", message: { content: [{ type: "text", text: "확인하겠습니다." }, { type: "tool_use" }] } }),
    line({ type: "user", message: { content: [{ type: "tool_result", content: "ok" }] } }),
    line({ type: "assistant", message: { content: [{ type: "text", text: "Done with the check." }] } }),
  ].join("\n");
  assert.deepEqual(lastTurnTexts(jsonl), ["확인하겠습니다.", "Done with the check."]);
});

test("실시간 기록: 명령 · 경로 · 내용은 안 나가고 종류 · 고정 문장 · 파일 이름만", () => {
  const root = "/repo";
  const post = (tool_name, tool_input, tool_response) => toActivity({ hook_event_name: "PostToolUse", tool_name, tool_input, tool_response }, root, "0046");
  const edit = post("Edit", { file_path: "/repo/apps/api/src/store.ts", old_string: "비밀 내용", new_string: "x" });
  assert.deepEqual(edit, { kind: "edit", label: "코드 수정", file: "store.ts", ok: null, task: "0046" });
  const bash = post("Bash", { command: "curl -H 'authorization: Bearer abc' https://x" }, { stdout: "ghp_secretsecretsecret" });
  assert.deepEqual(bash, { kind: "run", label: "API 확인", file: null, ok: null, task: "0046" });
  assert.ok(!JSON.stringify(bash).includes("Bearer") && !JSON.stringify(bash).includes("ghp_"));
});

test("실시간 기록: 비밀 파일 이름은 버림", () => {
  for (const p of ["/repo/.env", "/repo/apps/api/.dev.vars", "/repo/.env.local", "/repo/0123456789abcdef0123456789abcdef.txt", "/repo/a b.ts"]) assert.equal(safeFile(p), null, p);
  assert.equal(safeFile("/repo/page.test.tsx"), "page.test.tsx");
});

test("실시간 기록: 명령 분류 · 통과/실패", () => {
  assert.equal(classifyBash("ALLOW_PROTECTED=1 bash .agents/checks.sh > .tmp/gate.log").kind, "gate");
  assert.equal(classifyBash("cd apps/api && npx vitest run").kind, "test");
  assert.equal(classifyBash("git commit -F -").kind, "commit");
  assert.equal(classifyBash("gh pr create --label x").label, "PR 만듦");
  assert.equal(classifyBash("npm i three").kind, "install");
  assert.equal(classifyBash("grep -n x src").kind, "search");
  assert.equal(classifyBash("python3 x.py").label, "명령 실행");
  assert.equal(resultOf("gate", " 결과: ✅ ALL PASS (quick)"), true);
  assert.equal(resultOf("gate", "  ❌ FAIL — 테스트"), false);
  assert.equal(resultOf("test", "Tests  52 passed (52)"), true);
  assert.equal(resultOf("test", "Tests  1 failed | 51 passed"), false);
  assert.equal(resultOf("run", "passed"), null);
});

test("실시간 기록: 한 번에 커밋 · 올림 · PR 을 하면 가장 멀리 간 일 · PR 설명 글 속 checks.sh 는 무시 (작업 0066)", () => {
  const body = "gh pr create --title \"t\" --body \"$(cat <<'EOF'\n- `bash .agents/checks.sh` ALL PASS\nEOF\n)\"";
  assert.equal(classifyBash(`git add -A && git commit -q -m "x" && git push -q -u origin task/0065-a; ${body}; gh pr checks task/0065-a --watch`).label, "PR 만듦");
  assert.equal(classifyBash("git commit -q -m \"게이트 checks.sh 통과\"").label, "커밋");
  assert.equal(classifyBash("gh pr merge 66 --squash --delete-branch; git switch -q main").label, "PR 머지");
  assert.equal(classifyBash("git add -A && git commit -q -m x && git push -q -u origin task/0066-a").label, "브랜치 올림");
  assert.equal(classifyBash("bash .agents/checks.sh 2>&1 | grep -E \"결과|FAIL\"").kind, "gate");
  assert.equal(stripText("echo 'a checks.sh' \"b\" c"), "echo '' \"\" c");
});

test("실시간 기록: 머지 뒤 main 으로 돌아와도 배포 기록은 마지막 작업 번호 (작업 0066)", () => {
  const root = mkdtempSync(pathJoin(tmpdir(), "act-"));
  try {
    assert.equal(taskFor(root, null, "pr", 1000), null); // 기억한 게 없으면 없음
    assert.equal(taskFor(root, "0065", "gate", 1000), "0065");
    assert.equal(taskFor(root, null, "pr", 2000), "0065"); // main 에서 머지
    assert.equal(taskFor(root, null, "read", 2000), null); // 배포 쪽이 아니면 붙이지 않음
    assert.equal(taskFor(root, null, "pr", 1000 + 4 * 60 * 60 * 1000), null); // 3시간 넘으면 버림
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("실시간 기록: 하네스가 막을 쓰기는 실행 전에 🛑 · 그 밖의 실행 전 · 잡음 도구는 안 보냄", () => {
  const pre = (tool_name, tool_input) => toActivity({ hook_event_name: "PreToolUse", tool_name, tool_input }, "/repo", null);
  assert.equal(pre("Write", { file_path: "/etc/x" })?.kind, "blocked");
  assert.equal(pre("Write", { file_path: "/repo/a.ts" }), null);
  assert.equal(toActivity({ hook_event_name: "PostToolUse", tool_name: "mcp__ccd_turn__update_plan", tool_input: {} }, "/repo"), null);
});

test("작업 폴더 찾기: CI(떨어진 HEAD)는 GITHUB_HEAD_REF 로 (작업 0102)", () => {
  const dir = mkdtempSync(pathJoin(tmpdir(), "spec-"));
  try {
    mkdirSync(pathJoin(dir, ".agents/specs/0102-ci-branch-spec"), { recursive: true });
    const s = currentSpec(dir, { GITHUB_HEAD_REF: "task/0102-ci-branch-spec" });
    assert.equal(s.id, "0102");
    assert.equal(s.dir, pathJoin(".agents/specs", "0102-ci-branch-spec"));
    assert.equal(currentSpec(dir, { GITHUB_HEAD_REF: "" }).id, null); // 저장소가 아니면 브랜치 없음
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
