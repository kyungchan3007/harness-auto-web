// 작업 일지 — 저장소의 작업 폴더(.agents/specs/NNNN-*)를 빌드 때 읽어 요청 원문 · 허점 · PR 을 보여 줌 (LOG-01 · LOG-02 · 작업 0090)
//   여기는 순수 함수만 (파일 읽기는 journal-read.ts) · 비밀값 · 이메일은 가림 (LOG-04)

export type JournalEntry = {
  task: string; // NNNN
  slug: string; // 폴더 이름 뒤쪽 (fx-converter)
  /** 요청 원문 — 머리말 · 주석을 뺀 나머지 그대로 (요약하지 않음) */
  request: string;
  /** 무엇을 · 왜 첫 줄 */
  what: string | null;
  /** 허점 — "없음" 은 뺌 */
  gaps: string[];
};

/** 이메일 · 토큰 모양 글자를 가림 — 원문에 실수로 붙여 넣은 것이 있어도 공개 페이지에 나가지 않게 */
export function redact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "(이메일 가림)")
    .replace(/\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[abpr]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g, "(비밀값 가림)")
    .replace(/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{40,}\b/g, "(비밀값 가림)");
}

const stripComments = (md: string) => md.replace(/<!--[\s\S]*?-->/g, "");

/** request.md → 원문 (맨 위 "# 요청 원문" 머리말 · 안내 주석만 뺌) */
export function parseRequest(md: string): string {
  return redact(
    stripComments(md)
      .replace(/^#\s+요청 원문\s*$/m, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

/** "## 제목" 아래 목록 줄 (다음 "## " 까지) · 들여쓴 하위 줄은 앞 줄에 붙임 */
export function sectionBullets(md: string, heading: RegExp): string[] {
  const lines = stripComments(md).split("\n");
  const start = lines.findIndex((l) => /^##\s/.test(l) && heading.test(l));
  if (start < 0) return [];
  const out: string[] = [];
  for (const l of lines.slice(start + 1)) {
    if (/^##?\s/.test(l)) break;
    const top = l.match(/^[-*]\s+(.*)$/);
    if (top) out.push(top[1].trim());
    else if (/^\s+[-*]\s+/.test(l) && out.length > 0) out[out.length - 1] += ` · ${l.replace(/^\s+[-*]\s+/, "").trim()}`;
  }
  return out.filter((b) => b !== "" && !/^없음\.?$/.test(b)).map(redact);
}

const plain = (s: string) => s.replace(/\*\*|`/g, "");

/** 작업 폴더 하나의 파일들 → 일지 항목 · 요청 원문이 없으면 null */
export function entryOf(dir: string, files: { request?: string; plan?: string; trace?: string }): JournalEntry | null {
  const m = dir.match(/^(\d{4})-(.+)$/);
  if (!m || !files.request) return null;
  const request = parseRequest(files.request);
  if (request === "") return null;
  const what = files.plan ? (sectionBullets(files.plan, /무엇을/)[0] ?? null) : null;
  const gaps = [...(files.plan ? sectionBullets(files.plan, /허점/) : []), ...(files.trace ? sectionBullets(files.trace, /허점/) : [])];
  return { task: m[1], slug: m[2], request, what: what && plain(what), gaps: gaps.map(plain) };
}

/** 최근 작업부터 */
export const newestFirst = (a: JournalEntry, b: JournalEntry) => b.task.localeCompare(a.task);
