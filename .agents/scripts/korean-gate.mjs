// Stop 훅 — 이번 턴 에이전트 답에 영어 위주 글이 있으면 끝내지 못하게 돌려보낸다 (AGENTS.md 규칙 8 을 실행되는 검사로)
//   실제 대화 기록으로 잰 기준: 한국어 답은 영어 단어가 한글 단어의 0.6배 아래, 영어 답은 한글 단어가 거의 0
import { readFileSync } from "node:fs";

/** 코드 · 인라인 코드 · 링크 · 주소 · 태그를 빼고 사람이 읽는 글만 */
export function proseOf(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ");
}

const count = (s, re) => (s.match(re) ?? []).length;
const HANGUL = /[가-힣]+/g;
const LATIN = /[A-Za-z]{2,}/g;

/** 영어 위주인가 — 걸리면 이유, 아니면 null */
export function englishReason(text) {
  const prose = proseOf(text);
  const h = count(prose, HANGUL);
  const e = count(prose, LATIN);
  if (e >= 3 && e > h) return `영어 단어 ${e}개 · 한글 단어 ${h}개`;
  for (const para of prose.split(/\n\s*\n/)) {
    if (count(para, HANGUL) === 0 && count(para, LATIN) >= 6) return `한글 없는 영어 문단: "${para.trim().slice(0, 60)}"`;
  }
  return null;
}

/** 대화 기록(JSONL)에서 마지막 사람 메시지 뒤에 에이전트가 쓴 글 */
export function lastTurnTexts(jsonl) {
  const entries = jsonl.split("\n").flatMap((l) => {
    try {
      return [JSON.parse(l)];
    } catch {
      return [];
    }
  });
  const isHumanTurn = (d) => {
    if (d.type !== "user") return false;
    const c = d.message?.content;
    return typeof c === "string" || (Array.isArray(c) && c.some((x) => x.type === "text"));
  };
  let start = 0;
  entries.forEach((d, i) => {
    if (isHumanTurn(d)) start = i + 1;
  });
  return entries
    .slice(start)
    .filter((d) => d.type === "assistant")
    .flatMap((d) => (Array.isArray(d.message?.content) ? d.message.content : []))
    .filter((c) => c.type === "text" && c.text?.trim())
    .map((c) => c.text);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let raw = "";
  process.stdin.on("data", (c) => (raw += c));
  process.stdin.on("end", () => {
    let event = {};
    try { event = JSON.parse(raw || "{}"); } catch { process.exit(0); }
    if (event.stop_hook_active || !event.transcript_path) process.exit(0); // 한 번 돌려보낸 뒤면 무한 반복 방지
    let jsonl = "";
    try { jsonl = readFileSync(event.transcript_path, "utf8"); } catch { process.exit(0); }
    const hits = lastTurnTexts(jsonl).map((t) => [t, englishReason(t)]).filter(([, r]) => r);
    if (hits.length === 0) process.exit(0);
    const [text, reason] = hits[0];
    process.stderr.write(
      `[한국어 규칙] 이번 답에 영어 위주 글이 ${hits.length}개 있습니다 (AGENTS.md 규칙 8 — 사용자가 여러 번 지적함).\n` +
        `같은 내용을 한국어로 다시 써서 보내세요. 코드 · 명령 · 파일 이름만 영어로 둡니다.\n` +
        `첫 번째: ${reason} — "${text.trim().slice(0, 80)}"\n`,
    );
    process.exit(2);
  });
}
