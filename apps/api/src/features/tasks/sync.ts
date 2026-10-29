// GitHub 이슈 목록 → 저장할 행 → SQL — GitHub Actions 가 scripts/tasks-sql.ts 로 부름 (테스트 있음)
// 제목은 남이 쓴 글일 수 있는 **데이터**: 저장소 주인이 연 이슈 · 머지된 PR 만 쓰고, SQL 에는 이스케이프해서 넣는다
// 이 파일은 의존성 없이 (node --experimental-strip-types 로 바로 돌림)

export type GithubItem = {
  number: number;
  title: string;
  html_url: string;
  author_association?: string;
  pull_request?: { merged_at?: string | null } | null;
};

export type ItemRow = { number: number; kind: "issue" | "pr"; task: string | null; name: string; url: string; mergedAt: string | null };

const MAX_NAME = 120;

/** "[0046] 실시간 작업 기록 …" → { task: "0046", name: "실시간 작업 기록 …" } · 제어 문자 · 줄바꿈은 공백으로 */
export function splitTitle(title: string): { task: string | null; name: string } {
  const clean = title.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  // "[0056] 이름" · "작업 0058: 이름" 둘 다 — 작업 0057 부터 PR 제목을 뒤 모양으로 써서 번호를 못 읽었음 (작업 0066)
  const m = /^\[(\d{4})\]\s*(.+)$/.exec(clean) ?? /^작업\s*(\d{4})\s*[:：·-]\s*(.+)$/.exec(clean);
  const { task, name } = m ? { task: m[1], name: m[2] } : { task: null, name: clean };
  return { task, name: name.slice(0, MAX_NAME) };
}

const isUrl = (s: unknown): s is string => typeof s === "string" && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(issues|pull)\/\d+$/.test(s);

/** 쓸 것만: 주인이 연 이슈(PR 아님) · 머지된 PR · 모양이 이상하면 버림 */
export function toRows(items: unknown[]): ItemRow[] {
  const rows: ItemRow[] = [];
  for (const raw of items) {
    const i = raw as GithubItem;
    if (!i || typeof i.number !== "number" || typeof i.title !== "string" || !isUrl(i.html_url)) continue;
    const merged = i.pull_request?.merged_at;
    if (i.pull_request) {
      if (typeof merged !== "string" || Number.isNaN(Date.parse(merged))) continue; // 닫기만 한 PR · 열린 PR
      rows.push({ number: i.number, kind: "pr", ...splitTitle(i.title), url: i.html_url, mergedAt: new Date(merged).toISOString() });
    } else if (i.author_association === "OWNER") {
      rows.push({ number: i.number, kind: "issue", ...splitTitle(i.title), url: i.html_url, mergedAt: null });
    }
  }
  return rows;
}

const q = (v: string | number | null) => (v === null ? "NULL" : typeof v === "number" ? String(Math.trunc(v)) : `'${v.replace(/'/g, "''")}'`);

/** 표를 통째로 바꾸는 SQL (최근 100개씩이라 작음) */
export function toSql(rows: ItemRow[], syncedAt: string): string {
  const lines = ["DELETE FROM github_items;"];
  for (const r of rows) {
    lines.push(
      `INSERT INTO github_items (number, kind, task, name, url, merged_at, synced_at) VALUES (${[r.number, r.kind, r.task, r.name, r.url, r.mergedAt, syncedAt].map(q).join(", ")});`,
    );
  }
  return `${lines.join("\n")}\n`;
}
