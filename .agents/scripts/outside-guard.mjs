// PreToolUse 훅 — 작업 폴더(저장소) 밖에 쓰는 도구 호출을 실행 전에 막는다 (exit 2 = 차단, 이유는 에이전트에게 전달)
import { homedir } from "node:os";
import { isAbsolute, relative, resolve } from "node:path";

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
const WRITE_CMDS = new Set(["cp", "mv", "mkdir", "touch", "rm", "ln", "install", "rsync"]);

const expandHome = (p) => p.replace(/^(~|\$HOME|\$\{HOME\})(?=\/|$)/, homedir());
const strip = (t) => t.replace(/^["']|["';)]+$/g, "");

/** 이 프로젝트의 에이전트 기억 폴더 — ~/.claude/projects/(저장소 경로의 기호를 - 로)/memory (사용자 승인 2026-10-29: "규칙에 기억 폴더를 예외로 넣어") */
export const memoryDir = (root) => resolve(homedir(), ".claude", "projects", resolve(root).replace(/[^A-Za-z0-9]/g, "-"), "memory");

const inside = (abs, dir) => {
  const rel = relative(dir, abs);
  return !rel.startsWith("..") && !isAbsolute(rel);
};

/** 경로가 프로젝트 밖인가 (/dev/* · 이 프로젝트의 기억 폴더는 허용) */
export function isOutside(path, root, cwd = root) {
  const p = expandHome(strip(path));
  if (!p || p.startsWith("/dev/")) return false;
  const abs = isAbsolute(p) ? p : resolve(cwd, p);
  if (inside(abs, memoryDir(root))) return false;
  const rel = relative(root, abs);
  return rel.startsWith("..") || isAbsolute(rel);
}

/** Bash 명령에서 쓰기 대상 경로를 뽑는다: 리다이렉션 · tee · cp/mv/mkdir/touch/rm/ln 인자 */
/** heredoc 본문(글자)은 명령이 아니라서 뺀다 — 본문 속 `>/경로` 를 쓰기로 읽어 두 번 막혔음 (작업 0068 · 0069) · 첫 줄(`cat > f <<EOF`)은 남김 */
const stripHeredocs = (command) => command.replace(/(<<-?\s*(["']?)(\w+)\2[^\n]*)\n[\s\S]*?\n[ \t]*\3[ \t]*(?=\n|$)/g, "$1");

export function writeTargets(raw) {
  const command = stripHeredocs(raw);
  const targets = [];
  for (const m of command.matchAll(/(?:^|[^0-9&<])>>?\s*([^\s|;&<>]+)/g)) targets.push(m[1]);
  for (const part of command.split(/&&|\|\||;|\||\n/)) {
    const words = part.trim().split(/\s+/).filter(Boolean);
    const i = words.findIndex((w) => !/^\w+=/.test(w) && w !== "sudo");
    const cmd = words[i]?.split("/").pop();
    if (cmd === "tee") targets.push(...words.slice(i + 1).filter((w) => !w.startsWith("-")));
    if (WRITE_CMDS.has(cmd)) {
      const args = words.slice(i + 1).filter((w) => !w.startsWith("-"));
      targets.push(...(cmd === "cp" || cmd === "mv" || cmd === "ln" || cmd === "install" || cmd === "rsync" ? args.slice(-1) : args));
    }
  }
  return targets.filter((t) => t && !/^&\d$/.test(t));
}

/** 첫 `cd 경로 &&` 를 따라 명령의 실행 위치를 잡는다 */
const cdOf = (command, root) => {
  const m = /^\s*cd\s+([^\s;&|]+)/.exec(command);
  return m ? resolve(root, expandHome(strip(m[1]))) : root;
};

export function decide(event, root) {
  const input = event.tool_input ?? {};
  if (WRITE_TOOLS.has(event.tool_name)) {
    const p = input.file_path ?? input.notebook_path;
    if (p && isOutside(p, root)) return `작업 폴더 밖에 쓰려고 합니다: ${p} — 저장소 안(예: .tmp/)에 쓰세요`;
  }
  if (event.tool_name === "Bash" && input.command) {
    const cwd = cdOf(input.command, root);
    const bad = writeTargets(input.command).filter((t) => isOutside(t, root, cwd));
    if (bad.length) return `작업 폴더 밖에 쓰는 명령입니다: ${bad.join(", ")} — 임시 파일·로그도 저장소 안(예: .tmp/)에 쓰세요`;
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let raw = "";
  process.stdin.on("data", (c) => (raw += c));
  process.stdin.on("end", () => {
    let event = {};
    try { event = JSON.parse(raw || "{}"); } catch { process.exit(0); }
    const root = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
    const reason = decide(event, root);
    if (reason) { process.stderr.write(`[작업 폴더 규칙] ${reason}\n`); process.exit(2); }
    process.exit(0);
  });
}
