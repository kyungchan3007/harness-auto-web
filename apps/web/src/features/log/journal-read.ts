// 작업 일지 파일 읽기 — 빌드 때만 (서버) · 저장소의 .agents/specs 를 찾음 (apps/web 에서 빌드해도 · 저장소 뿌리에서 빌드해도) (작업 0090)
//   폴더를 못 찾으면 빈 목록 — 일지 칸은 "기록 없음" 으로 (빌드는 멈추지 않음)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type JournalEntry, entryOf, newestFirst } from "./journal";

const SPEC_DIRS = [resolve(process.cwd(), "../../.agents/specs"), resolve(process.cwd(), ".agents/specs")];

const read = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : undefined);

export function readJournal(): JournalEntry[] {
  const root = SPEC_DIRS.find((d) => existsSync(d));
  if (!root) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}-/.test(d.name))
    .map((d) => entryOf(d.name, { request: read(join(root, d.name, "request.md")), plan: read(join(root, d.name, "plan.md")), prd: read(join(root, d.name, "prd.md")), trace: read(join(root, d.name, "trace.md")) }))
    .filter((e): e is JournalEntry => e !== null)
    .sort(newestFirst);
}
