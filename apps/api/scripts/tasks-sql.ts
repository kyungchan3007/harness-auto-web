// GitHub Actions 가 부름: `gh api --paginate` 출력(JSON 배열 여러 개 · 한 줄씩) → D1 에 넣을 SQL
//   node --experimental-strip-types apps/api/scripts/tasks-sql.ts < .tmp/items.json > .tmp/tasks.sql
import { readFileSync } from "node:fs";
import { toRows, toSql } from "../src/features/tasks/sync.ts";

/** `[...][...]` 처럼 이어진 배열 · 한 줄에 하나씩인 객체 둘 다 받음 */
export function parseItems(text: string): unknown[] {
  const t = text.trim();
  if (!t) return [];
  try {
    const v = JSON.parse(t);
    return Array.isArray(v) ? v : [v];
  } catch {
    return t
      .replace(/\]\s*\[/g, ",")
      .split(/\n(?=[{[])/)
      .flatMap((chunk) => {
        const v = JSON.parse(chunk);
        return Array.isArray(v) ? v : [v];
      });
  }
}

const rows = toRows(parseItems(readFileSync(0, "utf8")));
process.stderr.write(`이슈 ${rows.filter((r) => r.kind === "issue").length}개 · 머지된 PR ${rows.filter((r) => r.kind === "pr").length}개\n`);
process.stdout.write(toSql(rows, new Date().toISOString()));
