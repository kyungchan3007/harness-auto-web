"use client";

// ④ 지난 작업 — 머지된 PR 카드 (GitHub Actions 가 D1 에 저장한 목록)
import type { Fetched } from "../../shared/api";
import type { TasksSummary } from "@hav/shared/tasks";
import { Card } from "@hav/ui/card";
import { Reveal } from "@hav/ui/reveal";
import { Section } from "@hav/ui/section";

export const REPO_URL = "https://github.com/kyungchan3007/harness-auto-web";
const SHOW = 12;
const dateText = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" });

export function DoneTasks({ tasks }: { tasks: Fetched<TasksSummary> }) {
  const done = tasks.ok ? tasks.data.done : [];
  return (
    <Section id="done" eyebrow={`지난 작업 · ${done.length}개`} title={<>머지된 것만,<br />하나씩.</>}>
      {!tasks.ok ? (
        <p>지난 작업을 불러오지 못했습니다 ({tasks.reason}) · 다시 열면 다시 받습니다</p>
      ) : done.length === 0 ? (
        <p>아직 받아 둔 작업 목록이 없습니다 · 다음 머지 때 GitHub 에서 받아 옵니다</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {done.slice(0, SHOW).map((t, i) => (
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
      )}
      <a href={`${REPO_URL}/pulls?q=is%3Amerged`} className="mt-10 inline-flex text-accent hover:underline">
        GitHub 에서 모두 보기 →
      </a>
    </Section>
  );
}
