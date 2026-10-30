"use client";

// 만드는 중 — 가운데 고정 패널 장면 ①~③ → ④ 작업 책상 · 다 한 일 선반 → 끝 숫자
// 패널은 화면에 고정하고 스크롤로 장면만 바뀜 (참고 페이지 방식) · 움직임 줄이기면 장면을 차례로 쌓음
import { CountUp } from "@hav/ui/count-up";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { type TasksSummary, blockMarks, snagText } from "@hav/shared/tasks";
import { useRef, useState } from "react";
import type { Fetched } from "../../shared/api";
import { TaskDesks } from "./task-desks";
import { LivePanel, type Mode } from "./live-panel";
import { MOOD_TEXT, moodOf } from "./mood";
import { liveStatus, todayStats } from "./status";
import { BlockTowerLazy, WorkerCatLazy } from "../../shared/three-lazy";
import type { Mood } from "@hav/ui/three/worker-cat";
import { type Activity, useActivity } from "./use-activity";
import { useTasks } from "./use-tasks";

const SCENES: { mode: Mode; title: string; body: (blocked: number) => string }[] = [
  { mode: "status", title: "지금, 무엇을 하고 있을까.", body: () => "에이전트가 도구를 쓸 때마다 이 패널이 바뀝니다. 10분 넘게 조용하면 쉬는 중이에요." },
  { mode: "log", title: "한 줄씩, 실시간으로.", body: () => "파일 이름과 하는 일만 보입니다. 명령 · 파일 내용 · 비밀값은 보내지 않아요." },
  { mode: "blocked", title: "막힌 것도 숨기지 않습니다.", body: (n) => (n > 0 ? `오늘 하네스가 멈춰 세운 순간 — ${n}번.` : "오늘은 아직 하네스가 막은 일이 없습니다.") },
];

export function LogBody({ buildTasks }: { buildTasks: Fetched<TasksSummary> }) {
  const activity = useActivity();
  const tasks = useTasks(buildTasks);
  const names = tasks.ok ? tasks.data.names : {};
  const doneCount = tasks.ok ? tasks.data.done.length : 0;
  const marks = tasks.ok ? blockMarks(tasks.data.done, tasks.data.snags) : [];
  const stats = todayStats(activity.events, activity.now);
  const reduce = useReducedMotion();
  const mood = moodOf(liveStatus(activity.events, activity.now));
  const props = { activity, names, blocked: stats.blocked, mood };

  return (
    <>
      {reduce ? <StackedScenes {...props} /> : <PinnedScenes {...props} />}
      <TaskDesks activity={activity} tasks={tasks} />
      <section data-surface="elevated" className="bg-surface px-4 py-24 text-fg sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          {/* 🧱 머지된 작업 하나 = 블록 하나 · 맨 위가 최신 (막힌 작업 표시는 작업별 기록이 없어 뺌 · docs/design.md) */}
          <div className="order-last md:order-first">
            <BlockTowerLazy count={doneCount} marks={marks} label={`블록 탑 — 머지된 작업 ${doneCount}개 · ${snagText(marks, tasks.ok ? tasks.data.snagsSince : null)}`} className="h-[340px] w-full sm:h-[420px]" />
            <p className="mt-2 flex items-start justify-center gap-2 text-center text-xs text-fg-2">
              <span aria-hidden className="mt-1 inline-block size-2 shrink-0 rounded-sm bg-expensive" />
              {snagText(marks, tasks.ok ? tasks.data.snagsSince : null)}
            </p>
          </div>
          <div>
            <p className="text-title font-semibold tracking-tight">
              한 블록 = 머지된 작업 하나.
            </p>
            <div className="mt-10 grid gap-10 sm:grid-cols-3 md:grid-cols-1">
              <Stat value={doneCount} label="머지된 작업" />
              <Stat value={stats.lines} label="오늘 남긴 기록 (최근 50줄 중)" />
              <Stat value={stats.blocked} label="오늘 하네스가 막은 것" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-hero font-bold tracking-tighter">
        <CountUp text={String(value)} className="text-aurora" />
      </p>
      <p className="mt-2 text-lead text-fg-2">{label}</p>
    </div>
  );
}

function Caption({ i, blocked }: { i: number; blocked: number }) {
  return (
    <div className="text-center">
      <p className="text-title font-semibold tracking-tight">{SCENES[i].title}</p>
      <p className="mx-auto mt-3 max-w-xl text-base text-fg-2 sm:text-lead">{SCENES[i].body(blocked)}</p>
    </div>
  );
}

type Props = { activity: Activity; names: Record<string, string>; blocked: number; mood: Mood };

/** 🐱 패널에 걸터앉은 작업 고양이 — 넓은 화면은 패널 오른쪽 옆 · 휴대폰은 패널 오른쪽 위 모서리 */
function Buddy({ mood }: { mood: Mood }) {
  return (
    <WorkerCatLazy
      mood={mood}
      label={MOOD_TEXT[mood]}
      className="pointer-events-none absolute -top-24 -right-2 z-10 size-28 sm:-top-32 sm:size-36 xl:top-auto xl:-right-56 xl:bottom-0 xl:size-56"
    />
  );
}

function PinnedScenes({ activity, names, blocked, mood }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 작게 → 크게 (①) · 끝에서 살짝 물러남 (지난 작업으로 넘어감)
  const scale = useTransform(scrollYProgress, [0, 0.18, 0.88, 1], [0.86, 1, 1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0.88, 1], [1, 0.35]);
  const [scene, setScene] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setScene(v < 0.33 ? 0 : v < 0.66 ? 1 : 2));

  return (
    <div ref={ref} data-surface="dark" className="relative h-[330vh] bg-surface text-fg">
      <div className="sticky top-20 flex h-[calc(100svh-5rem)] sm:top-13 sm:h-[calc(100svh-3.25rem)] flex-col justify-center gap-8 px-4 sm:px-8">
        <div className="relative mx-auto h-36 w-full max-w-3xl sm:h-32">
          {/* initial={false}: 첫 장면은 숨겼다 보여 주지 않음 (JS 전에도 보임 · LCP) */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scene} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
              <Caption i={scene} blocked={blocked} />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* 고양이가 앉을 자리만큼 위를 비움 — 넓은 화면(xl)은 패널 옆이라 필요 없음 · 전엔 1,100px 안팎에서 설명 글을 가렸음 (작업 0062) */}
        <motion.div style={{ scale, opacity }} className="relative mx-auto mt-12 w-full max-w-3xl sm:mt-20 xl:mt-0">
          <Buddy mood={mood} />
          <LivePanel activity={activity} names={names} mode={SCENES[scene].mode} />
        </motion.div>
        <SceneDots scene={scene} />
      </div>
    </div>
  );
}

function SceneDots({ scene }: { scene: number }) {
  return (
    <div className="flex justify-center gap-2" aria-hidden>
      {SCENES.map((s, i) => (
        <span key={s.mode} className={`h-1.5 rounded-full transition-all duration-500 ${i === scene ? "w-6 bg-accent" : "w-1.5 bg-line"}`} />
      ))}
    </div>
  );
}

function StackedScenes({ activity, names, blocked, mood }: Props) {
  return (
    <div data-surface="dark" className="space-y-24 bg-surface px-4 py-24 text-fg sm:px-8">
      {SCENES.map((s, i) => (
        <div key={s.mode} className="mx-auto max-w-3xl space-y-8">
          <Caption i={i} blocked={blocked} />
          <div className={`relative ${i === 0 ? "mt-12 sm:mt-20 xl:mt-0" : ""}`}>
            {i === 0 && <Buddy mood={mood} />}
            <LivePanel activity={activity} names={names} mode={s.mode} />
          </div>
        </div>
      ))}
    </div>
  );
}
