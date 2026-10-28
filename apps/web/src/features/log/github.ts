// 지난 작업 · 작업 이름 — 빌드 때 GitHub API (인증 없이 · 시간당 60번) · 실패해도 빌드는 성공
import { type Fetched, getJson } from "../../shared/api";
import { z } from "zod";

export const REPO = "kyungchan3007/harness-auto-web";
export const REPO_URL = `https://github.com/${REPO}`;
const GITHUB = "https://api.github.com";

/** "[0046] 실시간 작업 기록 …" → { task: "0046", name: "실시간 작업 기록 …" } */
export function splitTitle(title: string): { task: string | null; name: string } {
  const m = /^\[(\d{4})\]\s*(.+)$/.exec(title.trim());
  return m ? { task: m[1], name: m[2] } : { task: null, name: title.trim() };
}

const Pull = z.object({ number: z.number(), title: z.string(), html_url: z.string(), merged_at: z.string().nullable() });
const Issue = z.object({ number: z.number(), title: z.string(), pull_request: z.unknown().optional() });

export type DoneTask = { number: number; task: string | null; name: string; url: string; mergedAt: string };

/** 닫힌 PR 중 **머지된 것만** · 최근 머지부터 */
export function toDoneTasks(pulls: z.infer<typeof Pull>[]): DoneTask[] {
  return pulls
    .filter((p): p is typeof p & { merged_at: string } => p.merged_at !== null)
    .map((p) => ({ number: p.number, ...splitTitle(p.title), url: p.html_url, mergedAt: p.merged_at }))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

/** 이슈 제목에서 작업 번호 → 이름 (PR 은 빼고) */
export function toTaskNames(issues: z.infer<typeof Issue>[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const i of issues) {
    if (i.pull_request) continue;
    const { task, name } = splitTitle(i.title);
    if (task && !names[task]) names[task] = name;
  }
  return names;
}

export async function fetchDoneTasks(fetcher?: typeof fetch): Promise<Fetched<DoneTask[]>> {
  const r = await getJson(`/repos/${REPO}/pulls?state=closed&per_page=100`, z.array(Pull), { base: GITHUB, fetcher });
  return r.ok ? { ok: true, data: toDoneTasks(r.data) } : r;
}

export async function fetchTaskNames(fetcher?: typeof fetch): Promise<Fetched<Record<string, string>>> {
  const r = await getJson(`/repos/${REPO}/issues?state=all&per_page=100`, z.array(Issue), { base: GITHUB, fetcher });
  return r.ok ? { ok: true, data: toTaskNames(r.data) } : r;
}
