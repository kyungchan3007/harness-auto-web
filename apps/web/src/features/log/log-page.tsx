// 만드는 중 페이지 — 시작 제목 → 가운데 고정 패널 ①~③ → ④ 지난 작업 → 끝 숫자 (docs/design.md "만드는 중" 페이지)
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import { Card } from "@hav/ui/card";
import { Reveal } from "@hav/ui/reveal";
import { Section } from "@hav/ui/section";
import { type DoneTask, REPO_URL } from "./github";
import { LogBody } from "./log-body";

const SHOW_DONE = 12;
const dateText = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" });

export function LogPage({ done, names }: { done: Fetched<DoneTask[]>; names: Record<string, string> }) {
  const tasks = done.ok ? done.data : [];
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

      <LogBody names={names} doneCount={tasks.length}>
        <Section id="done" eyebrow={`지난 작업 · ${tasks.length}개`} title={<>머지된 것만,<br />하나씩.</>}>
          {done.ok ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.slice(0, SHOW_DONE).map((t, i) => (
                <Reveal key={t.number} delay={(i % 3) * 0.08}>
                  <a href={t.url} className="block h-full transition-transform hover:-translate-y-1">
                    <Card title={t.name}>
                      <p className="font-mono text-sm">
                        #{t.number}
                        {t.task && ` · 작업 ${t.task}`} · {dateText(t.mergedAt)}
                      </p>
                    </Card>
                  </a>
                </Reveal>
              ))}
            </div>
          ) : (
            <p>지난 작업을 불러오지 못했습니다 ({done.reason}) · 다음 빌드 때 다시 받습니다</p>
          )}
          <a href={`${REPO_URL}/pulls?q=is%3Amerged`} className="mt-10 inline-flex text-accent hover:underline">
            GitHub 에서 모두 보기 →
          </a>
        </Section>
      </LogBody>

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
