// PreToolUse · PostToolUse 훅 — 에이전트가 지금 하는 일을 "만드는 중" 페이지로 보낸다 (공개)
// 거르는 규칙: 종류 · 고정된 한국어 문장 · 파일 **이름만** · 작업 번호 · 통과/실패만 보냄
//   명령어 · 파일 내용 · 도구 결과 글 · 경로는 절대 보내지 않음 (출력은 통과/실패를 가리는 데만 읽고 버림)
// 보내기는 따로 띄운 프로세스가 함 → 훅은 바로 끝남 · 실패해도 작업을 막지 않음 (항상 exit 0)
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { decide } from "./outside-guard.mjs";

const DEFAULT_URL = "https://tripfx-api.developfff.workers.dev/activity";
const TIMEOUT_MS = 3000;

/** 비밀값처럼 생긴 글 — packages/shared/src/activity.ts 와 같은 규칙 */
const SECRET_SHAPES = [
  /\b(ghp|gho|ghs|ghu|github_pat|sk|pk|rk|xox[abprs]|AKIA|ASIA)[-_][A-Za-z0-9_-]{8,}/i,
  /\b[0-9a-f]{32,}\b/i,
  /[A-Za-z0-9+/_-]{40,}={0,2}/,
  /\beyJ[A-Za-z0-9_-]{10,}\./,
  /\bbearer\s+\S+/i,
];
export const looksSecret = (s) => SECRET_SHAPES.some((r) => r.test(s));

/** 경로 → 파일 이름만 · 비밀 파일이거나 이상한 이름이면 null */
export function safeFile(path) {
  if (typeof path !== "string" || !path) return null;
  const name = basename(path);
  if (!/^[\w.@+-]{1,80}$/.test(name) || /^\.(env|dev\.vars)/i.test(name) || looksSecret(name)) return null;
  return name;
}

/** Bash 명령 → 종류 · 고정 문장 (명령 글은 밖으로 나가지 않음) · 위에서부터 먼저 맞는 것 */
// 앞에서부터 처음 맞는 줄 — 배포 쪽(머지 · PR 만듦 · 올림)을 먼저 봄: 커밋 · 올림 · PR 을 한 번에 하면 가장 멀리 간 일로 (작업 0066)
const BASH_RULES = [
  [/\bgh pr (merge)\b/, "pr", "PR 머지"],
  [/\bgh pr (create)\b/, "pr", "PR 만듦"],
  [/\bgit push\b/, "pr", "브랜치 올림"],
  [/checks\.sh/, "gate", "게이트 검사"],
  [/\b(vitest|playwright)\b|\bnpm (run )?test\b|node --test|turbo run test/, "test", "테스트 실행"],
  [/\btsc\b|\beslint\b|\bnpm run (lint|typecheck)\b/, "test", "타입 · 린트 검사"],
  [/\bnpm run build\b|next build|turbo run build|--dry-run/, "build", "빌드"],
  [/\bgit commit\b/, "commit", "커밋"],
  [/\bgh (pr|run|issue)\b/, "pr", "GitHub 확인"],
  [/\bnpm (i|install|ci|uninstall)\b/, "install", "패키지 설치"],
  [/drizzle-kit|migrations apply/, "run", "DB 마이그레이션"],
  [/\bwrangler (dev|deploy)\b/, "run", "API 실행"],
  [/\bcurl\b/, "run", "API 확인"],
  [/^\s*(cd [^&]+&&\s*)?(grep|rg|find|ls|wc)\b/, "search", "코드 찾기"],
  [/^\s*(cd [^&]+&&\s*)?(cat|head|tail|sed -n)\b/, "read", "파일 읽기"],
  [/\bgit (status|diff|log|show)\b/, "read", "변경 확인"],
];

/** 명령에서 글(따옴표 안 · heredoc 본문)을 뺌 — PR 설명에 "checks.sh" 가 있어 커밋 · PR 을 게이트로 잘못 셌음 (작업 0066) */
export function stripText(command) {
  return command
    .replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1\b/g, "<<글")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'[^']*'/g, "''");
}

export function classifyBash(command) {
  const c = stripText(command);
  for (const [re, kind, label] of BASH_RULES) if (re.test(c)) return { kind, label };
  return { kind: "run", label: "명령 실행" };
}

/** 테스트 · 게이트 출력에서 통과/실패만 (글은 버림) — 모르면 null */
export function resultOf(kind, output) {
  if ((kind !== "test" && kind !== "gate") || typeof output !== "string" || !output) return null;
  if (/❌ FAIL|\bTests?\s+\d+ failed|\bfailed\b|# fail [1-9]|error TS\d+/i.test(output)) return false;
  if (/ALL PASS|\bpassed\b|# fail 0/.test(output)) return true;
  return null;
}

const SKIP_TOOLS = /^(ToolSearch|TodoWrite|mcp__ccd_turn__|mcp__ccd_session|mcp__ccd_view|mcp__visualize__read_me)/;

/** 훅 입력 → 보낼 기록 (안 보낼 거면 null) */
export function toActivity(event, root, task = null) {
  const tool = event.tool_name ?? "";
  const input = event.tool_input ?? {};
  let a = null;
  if (event.hook_event_name === "PreToolUse") {
    // 실행 전에는 하네스가 막을 일만 기록 (outside-guard 와 같은 판단)
    if (decide(event, root)) a = { kind: "blocked", label: "작업 폴더 밖 쓰기를 하네스가 막음", ok: false };
  } else if (event.hook_event_name === "PostToolUse" && !SKIP_TOOLS.test(tool)) {
    if (tool === "Edit" || tool === "MultiEdit" || tool === "NotebookEdit") a = { kind: "edit", label: "코드 수정", file: safeFile(input.file_path ?? input.notebook_path) };
    else if (tool === "Write") a = { kind: "edit", label: "파일 쓰기", file: safeFile(input.file_path) };
    else if (tool === "Read") a = { kind: "read", label: "파일 읽기", file: safeFile(input.file_path) };
    else if (tool === "Grep" || tool === "Glob") a = { kind: "search", label: "코드 찾기" };
    else if (tool === "Bash" && typeof input.command === "string") {
      const c = classifyBash(input.command);
      const r = event.tool_response ?? {};
      a = { ...c, ok: resultOf(c.kind, `${r.stdout ?? ""}\n${r.stderr ?? ""}`) };
    } else if (tool === "WebFetch" || tool === "WebSearch") a = { kind: "browser", label: "웹 문서 읽기" };
    else if (/Browser__|claude-in-chrome__/.test(tool)) a = { kind: "browser", label: "브라우저로 화면 확인" };
    else if (tool === "Agent" || tool === "Task") a = { kind: "other", label: "도우미에게 맡김" };
    else a = { kind: "other", label: "도구 사용" };
  }
  if (!a) return null;
  const out = { kind: a.kind, label: a.label, file: a.file ?? null, ok: a.ok ?? null, task };
  // 마지막 안전장치 — 고정 문장 · 이름만 넣지만 그래도 비밀 모양이면 버림
  if (looksSecret(out.label) || (out.file && looksSecret(out.file))) return null;
  return out;
}

/** 브랜치 이름(task/NNNN-…)에서 작업 번호 */
export function taskOf(root) {
  try {
    const head = readFileSync(join(root, ".git", "HEAD"), "utf8");
    return /refs\/heads\/task\/(\d{4})-/.exec(head)?.[1] ?? null;
  } catch {
    return null;
  }
}

const LAST_TASK = (root) => join(root, ".tmp", "activity-last-task");
const LAST_TASK_MS = 3 * 60 * 60 * 1000;

/** 보낼 작업 번호 — 브랜치에 있으면 그것(기억해 둠) · 없을 때 배포 쪽 기록(pr)이면 마지막 작업 번호
 *  "gh pr merge --delete-branch" 는 끝나면 main 으로 돌아와 있어서 머지 기록에 작업 번호가 빠졌음 (작업 0066) */
export function taskFor(root, branchTask, kind, now = Date.now()) {
  try {
    if (branchTask) {
      mkdirSync(join(root, ".tmp"), { recursive: true });
      writeFileSync(LAST_TASK(root), `${branchTask} ${now}`);
      return branchTask;
    }
    if (kind !== "pr") return null;
    const [task, at] = readFileSync(LAST_TASK(root), "utf8").trim().split(" ");
    return /^\d{4}$/.test(task) && now - Number(at) < LAST_TASK_MS ? task : null;
  } catch {
    return branchTask ?? null;
  }
}

const tokenOf = (root) => {
  if (process.env.TRIPFX_ACTIVITY_TOKEN) return process.env.TRIPFX_ACTIVITY_TOKEN.trim();
  try {
    return readFileSync(join(root, ".tmp", "activity-token"), "utf8").trim() || null;
  } catch {
    return null;
  }
};

async function send(body, root) {
  const token = tokenOf(root);
  if (!token) return;
  await fetch(process.env.TRIPFX_ACTIVITY_URL || DEFAULT_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch(() => {});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (process.argv[2] === "--send") {
    // 따로 띄운 프로세스: 보내기만
    send(process.argv[3], root).finally(() => process.exit(0));
  } else {
    let raw = "";
    process.stdin.on("data", (c) => (raw += c));
    process.stdin.on("end", () => {
      try {
        const event = JSON.parse(raw || "{}");
        const a = toActivity(event, process.env.CLAUDE_PROJECT_DIR || event.cwd || root, taskOf(root));
        if (a) a.task = taskFor(root, a.task, a.kind);
        if (a && tokenOf(root)) spawn(process.execPath, [process.argv[1], "--send", JSON.stringify(a)], { detached: true, stdio: "ignore", env: process.env }).unref();
      } catch {
        // 기록이 실패해도 작업은 계속
      }
      process.exit(0);
    });
  }
}
