// 작업 일지 칸 — 작업마다 요청 원문(그대로) · 허점(실수 · 구멍) · 머지된 PR (LOG-02 · LOG-03 · 작업 0090)
//   빌드 때 만든 HTML 에 다 들어감 (자바스크립트 없이 열고 닫음 · details)
import type { DoneTask } from "@hav/shared/tasks";
import type { JournalEntry } from "./journal";
import { REPO_URL } from "@/shared/site";

const FIRST = 15;

/** 계획 첫 줄은 길어서 첫 마디(" — " · " · " 앞)만 · 60자까지 */
export const shortWhat = (what: string | null) => (what ? what.split(/ — | · /)[0].slice(0, 60) : null);
const date = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" });

type Props = { entries: JournalEntry[]; names: Record<string, string>; done: DoneTask[] };

export function JournalList({ entries, names, done }: Props) {
  // 작업 하나에 PR 이 여럿이면 가장 늦게 머지된 것
  const prOf = new Map<string, DoneTask>();
  for (const d of [...done].sort((a, b) => a.mergedAt.localeCompare(b.mergedAt))) if (d.task) prOf.set(d.task, d);
  // 제목: 머지된 PR 이름 → 이슈 이름 → 계획 첫 줄 앞부분 → 폴더 이름
  const titleOf = (e: JournalEntry) => prOf.get(e.task)?.name ?? names[e.task] ?? shortWhat(e.what) ?? e.slug;
  const gapCount = entries.reduce((n, e) => n + e.gaps.length, 0);

  return (
    <section id="journal" data-surface="dark" aria-labelledby="journal-title" className="bg-surface px-4 py-24 text-fg sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="text-eyebrow font-semibold text-fg-2">작업 일지</p>
        <h2 id="journal-title" className="mt-3 text-title font-semibold tracking-tight">
          받은 말 그대로,
          <br />
          실수까지 같이.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-fg-2">
          작업 {entries.length}개 · 적어 둔 허점 {gapCount}개. 요청은 요약하지 않고 받은 그대로 남깁니다. 이메일 · 비밀값처럼 보이는 글자는 가립니다.
        </p>
        {entries.length === 0 ? (
          <p className="mt-10 rounded-card border border-line p-6 text-sm text-fg-2">작업 기록을 찾지 못했습니다</p>
        ) : (
          <>
            <ol className="mt-10 grid gap-3">
              {entries.slice(0, FIRST).map((e, i) => (
                <Entry key={e.task} entry={e} title={titleOf(e)} pr={prOf.get(e.task)} open={i === 0} />
              ))}
            </ol>
            {entries.length > FIRST && (
              <details className="group mt-3">
                <summary className="cursor-pointer list-none rounded-card border border-line px-5 py-4 text-sm font-semibold text-fg-2 hover:text-fg">
                  이전 작업 {entries.length - FIRST}개 더 보기 <span className="group-open:hidden">↓</span>
                </summary>
                <ol className="mt-3 grid gap-3">
                  {entries.slice(FIRST).map((e) => (
                    <Entry key={e.task} entry={e} title={titleOf(e)} pr={prOf.get(e.task)} open={false} />
                  ))}
                </ol>
              </details>
            )}
            <p className="mt-8 text-xs text-fg-2">
              원본: 저장소의{" "}
              <a href={`${REPO_URL}/tree/main/.agents/specs`} className="text-accent underline underline-offset-2 hover:decoration-2">
                .agents/specs
              </a>{" "}
              (작업마다 request.md · plan.md)
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function Entry({ entry: e, title, pr, open }: { entry: JournalEntry; title: string; pr?: DoneTask; open: boolean }) {
  return (
    <li>
      <details open={open} className="group rounded-card bg-surface-2 ring-1 ring-line open:ring-fg-2/40">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-4">
          <span className="font-mono text-xs text-fg-2">{e.task}</span>
          <span className="min-w-0 flex-1 font-semibold">{title}</span>
          <span className="text-xs text-fg-2">
            {pr ? `${date.format(new Date(pr.mergedAt))} 머지` : "머지 기록 아직 없음"}
            {e.gaps.length > 0 && <span className="ml-2 text-expensive">허점 {e.gaps.length}</span>}
          </span>
        </summary>
        <div className="grid gap-5 border-t border-line px-5 pt-4 pb-5 text-sm">
          <div>
            <p className="text-xs font-semibold text-fg-2">요청 원문</p>
            <blockquote className="mt-2 border-l-2 border-accent/60 pl-4 leading-relaxed whitespace-pre-wrap break-words text-fg">{e.request.replace(/^## /gm, "▸ ")}</blockquote>
          </div>
          {e.assumptions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-fg-2">애매한 곳 — 물어서 정한 것 (확인됨) · 스스로 정한 것 (가정)</p>
              <ul className="mt-2 grid gap-1.5 leading-relaxed">
                {e.assumptions.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span aria-hidden className={`mt-2 inline-block size-1.5 shrink-0 rounded-full ${/확인됨/.test(a) ? "bg-cheap" : "bg-normal"}`} />
                    <span className="break-words">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {e.gaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-fg-2">허점 — 이번에 드러난 실수 · 구멍</p>
              <ul className="mt-2 grid gap-1.5 leading-relaxed">
                {e.gaps.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span aria-hidden className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-expensive" />
                    <span className="break-words">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {pr && (
            <a href={pr.url} className="text-xs font-semibold text-accent hover:underline">
              PR #{pr.number} 보기 →
            </a>
          )}
        </div>
      </details>
    </li>
  );
}
