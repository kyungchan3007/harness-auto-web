// 만드는 중 페이지 — 시작 제목 → 가운데 고정 패널 ①~③ → ④ 지난 작업 → 끝 숫자 (docs/design.md "만드는 중" 페이지)
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { TasksSummary } from "@hav/shared/tasks";
import { Reveal } from "@hav/ui/reveal";
import { REPO_URL } from "./done-tasks";
import { LogBody } from "./log-body";

export function LogPage({ tasks }: { tasks: Fetched<TasksSummary> }) {
  return (
    <>
      <SiteNav page="log" />

      <section data-surface="dark" className="bg-surface px-4 pt-24 pb-12 text-fg sm:px-8 sm:pt-32">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <p className="text-eyebrow font-semibold text-fg-2">만드는 중</p>
            <h1 className="mt-4 text-hero font-bold tracking-tighter">
              이 사이트는
              <br />
              <span className="text-aurora">AI 코딩 에이전트</span>가
              <br />
              만들고 있습니다.
            </h1>
            <p className="mt-8 max-w-2xl text-lead text-fg-2">환율을 받는 일부터 이 페이지까지. 지금 무엇을 하고 있는지, 어디서 막혔는지 그대로 보여 줍니다.</p>
          </div>
        </Reveal>
      </section>

      <LogBody buildTasks={tasks} />

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
