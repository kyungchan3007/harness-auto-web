"use client";

// ④ 작업 책상 — 이슈 적기 → 작업하기 → 테스트 → 배포 책상 · 🐱 작업 고양이가 지금 단계 책상으로 걸어감 · 끝난 작업은 선반에
// 단계는 실제 기록으로만 (stage.ts) · 3D 장면은 디자인 시스템(@hav/ui/three/stations)
import type { TasksSummary } from "@hav/shared/tasks";
import { Section } from "@hav/ui/section";
import type { Fetched } from "../../shared/api";
import { REPO_URL } from "../../shared/site";
import { StationsLazy } from "../../shared/three-lazy";
import { MOOD_TEXT, moodOf } from "./mood";
import { STAGES, deskState } from "./stage";
import { liveStatus } from "./status";
import type { Activity } from "./use-activity";

const SHELF = 30;

export function TaskDesks({ activity, tasks }: { activity: Activity; tasks: Fetched<TasksSummary> }) {
  const done = tasks.ok ? tasks.data.done : [];
  const names = tasks.ok ? tasks.data.names : {};
  const desk = deskState(activity.events, done);
  const status = liveStatus(activity.events, activity.now);
  const mood = moodOf(status);
  // 끝난 작업은 선반으로 → 캐릭터는 1번 책상에서 다음 작업을 기다림
  const active = desk.finished ? 0 : desk.stage;
  const doneCount = desk.finished ? 0 : desk.stage;
  const name = desk.task ? (names[desk.task]?.split(" — ")[0] ?? null) : null;

  return (
    <Section id="done" eyebrow="작업 책상" title={<>한 단계씩,<br />책상을 옮겨 갑니다.</>}>
      <p className="text-base text-fg">
        {!desk.task
          ? "아직 기록이 없습니다"
          : desk.finished
            ? <>작업 {desk.task} 끝 · <span className="text-fg-2">다음 작업을 기다리는 중</span></>
            : <>지금 작업 · <span className="font-mono">{desk.task}</span>{name && <> · {name}</>}</>}
      </p>

      <StationsLazy
        count={STAGES.length}
        active={active}
        done={doneCount}
        mood={mood}
        label={`${MOOD_TEXT[mood]} · ${desk.finished ? "다음 작업 대기" : `${STAGES[active].name} 단계`}`}
        className="mt-6 h-52 w-full sm:h-72"
      />

      <ol className="grid grid-cols-4 gap-2 text-center sm:gap-4">
        {STAGES.map((s, i) => {
          const state = i < doneCount ? "끝" : i === active && desk.task && !desk.finished ? "지금" : "대기";
          return (
            <li key={s.id} className={`rounded-card p-3 sm:p-4 ${state === "지금" ? "bg-surface-2 ring-1 ring-accent" : "bg-surface-2/60"}`}>
              <p className="text-xl sm:text-2xl" aria-hidden>
                {s.icon}
              </p>
              <p className="mt-1 text-xs font-semibold text-fg sm:text-base">
                {i + 1} {s.name}
              </p>
              <p className="mt-1 hidden text-xs text-fg-2 sm:block">{s.hint}</p>
              <p className={`mt-2 text-xs font-semibold ${state === "지금" ? "text-accent" : state === "끝" ? "text-aurora-2" : "text-fg-2"}`}>{state}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-12 text-sm text-fg-2">다 한 일 선반 · {done.length}개</p>
      {tasks.ok ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {done.slice(0, SHELF).map((t, i) => (
            <li key={t.number}>
              <a
                href={t.url}
                title={t.name}
                className={`inline-flex rounded-md px-3 py-1.5 font-mono text-xs ring-1 transition-colors hover:text-fg ${
                  i === 0 && desk.finished && t.task === desk.task ? "text-accent ring-accent" : "text-fg-2 ring-line"
                }`}
              >
                #{t.number}
                {t.task && ` · ${t.task}`}
              </a>
            </li>
          ))}
          {done.length > SHELF && <li className="px-2 py-1.5 font-mono text-xs text-fg-2">+{done.length - SHELF}</li>}
        </ul>
      ) : (
        <p className="mt-3 text-sm">지난 작업을 불러오지 못했습니다 ({tasks.reason}) · 다시 열면 다시 받습니다</p>
      )}
      <a href={`${REPO_URL}/pulls?q=is%3Amerged`} className="mt-8 inline-flex text-sm text-accent hover:underline">
        GitHub 에서 모두 보기 →
      </a>
    </Section>
  );
}
