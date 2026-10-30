// 만드는 중 페이지 — 가운데 고정 패널 ①~③ → ④ 작업 책상 → 끝 숫자 → 작업 일지(작업 0090) (docs/design.md "만드는 중" 페이지)
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { TasksSummary } from "@hav/shared/tasks";
import type { JournalEntry } from "./journal";
import { JournalList } from "./journal-list";
import { REPO_URL } from "./task-desks";
import { LogBody } from "./log-body";

export function LogPage({ tasks, journal }: { tasks: Fetched<TasksSummary>; journal: JournalEntry[] }) {
  return (
    <>
      <SiteNav page="log" />

      {/* 큰 시작 제목은 뺌 (2026-10-29 · 작업 0057) — 바로 장면 ① 부터 · 제목은 화면 읽기용으로만 */}
      <h1 className="sr-only">만드는 중 — AI 코딩 에이전트가 이 사이트를 만드는 과정</h1>

      <LogBody buildTasks={tasks} />

      <JournalList entries={journal} names={tasks.ok ? tasks.data.names : {}} done={tasks.ok ? tasks.data.done : []} />

      <footer data-surface="dark" className="border-t border-line bg-surface px-4 py-10 text-xs text-fg-2 sm:px-8">
        <div className="mx-auto max-w-5xl">
          기록은 에이전트의 도구 사용 훅이 보냅니다 · 공개 일지의 원본은{" "}
          <a href={REPO_URL} className="text-accent hover:underline">
            GitHub 커밋 · PR
          </a>
        </div>
      </footer>
    </>
  );
}
