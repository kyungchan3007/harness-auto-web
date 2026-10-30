"use client";

// 가운데 패널 — 터미널 느낌 · 장면(mode)에 따라 보이는 것만 바뀜 (같은 패널 하나)
import type { ActivityEvent } from "@hav/shared/activity";
import { AnimatePresence, motion } from "motion/react";
import type { Activity } from "./use-activity";
import { KIND, clockText, liveStatus } from "./status";

export type Mode = "status" | "log" | "blocked";

const LINES: Record<Mode, number> = { status: 4, log: 14, blocked: 14 };

export function LivePanel({ activity, names, mode }: { activity: Activity; names: Record<string, string>; mode: Mode }) {
  const { events, loaded, error, now } = activity;
  const status = liveStatus(events, now);
  const working = status.state === "working";
  const taskName = status.state !== "none" && status.task ? (names[status.task] ?? null) : null;
  // 큰 줄에는 " — " 앞 짧은 이름만 (긴 설명은 상태 줄에)
  const shortName = taskName?.split(" — ")[0] ?? null;

  return (
    <div className="overflow-hidden rounded-card bg-surface-2 text-fg shadow-2xl ring-1 ring-line">
      {/* 창 머리 */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 font-mono text-xs text-fg-2">
        <span className="size-3 rounded-full bg-line" />
        <span className="size-3 rounded-full bg-line" />
        <span className="size-3 rounded-full bg-line" />
        <span className="ml-2 truncate">tripfx — 작업실</span>
        <span className="ml-auto flex items-center gap-2" aria-live="polite">
          <span className={`size-2 rounded-full ${working ? "animate-pulse bg-accent" : "bg-fg-2"}`} />
          {working ? "작업 중" : status.state === "idle" ? "쉬는 중" : "기다리는 중"}
        </span>
      </div>

      {/* 기록이 오기 전에도 받은 뒤 높이만큼 자리를 잡아 둠 — 패널이 가운데 정렬이라 커지면 화면이 밀렸음 (CLS · 작업 0060 · 실측 휴대폰 300 · 넓은 화면 320) */}
      <div className="min-h-[300px] p-5 sm:min-h-[320px] sm:p-8">
        {/* 큰 한 줄 */}
        <p className={`font-semibold tracking-tight transition-all duration-500 ${mode === "status" ? "text-3xl sm:text-4xl" : "text-xl"}`}>
          {error && events.length === 0
            ? "기록을 불러오지 못했습니다"
            : status.state === "none"
              ? loaded
                ? "아직 기록이 없습니다"
                : "불러오는 중…"
              : working
                ? <>지금, <span className="text-aurora">{shortName ?? (status.task ? `작업 ${status.task}` : "무언가")}</span> 작업 중</>
                : <>쉬는 중 <span className="text-fg-2">· 마지막 작업 {status.ago}</span></>}
        </p>
        {error && <p className="mt-2 text-xs text-fg-2">연결이 끊겼습니다 · 다시 시도하는 중 ({error})</p>}

        {/* 상태 줄 — 첫 장면에서만 */}
        <AnimatePresence initial={false}>
          {mode === "status" && status.state !== "none" && (
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 pt-6 font-mono text-xs sm:gap-x-6 sm:text-sm"
            >
              <dt className="text-fg-2">작업</dt>
              <dd className="truncate">{status.task ? `${status.task}${taskName ? ` · ${taskName}` : ""}` : "—"}</dd>
              <dt className="text-fg-2">지금 하는 일</dt>
              <dd className="truncate">
                {KIND[status.last.kind].icon} {status.last.label}
                {status.last.file && <span className="text-fg-2"> · {status.last.file}</span>}
                <span className="text-fg-2"> · {status.ago}</span>
              </dd>
              <dt className="text-fg-2">게이트</dt>
              <dd>{gateText(status.gate)}</dd>
            </motion.dl>
          )}
        </AnimatePresence>

        {/* 기록 줄 */}
        <ol className="mt-6 space-y-1 font-mono text-xs sm:text-sm" aria-label="실시간 기록">
          <AnimatePresence initial={false}>
            {events.slice(0, LINES[mode]).map((e) => (
              <Line key={e.id} e={e} dim={mode === "blocked" && e.kind !== "blocked"} />
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}

function Line({ e, dim }: { e: ActivityEvent; dim: boolean }) {
  const blocked = e.kind === "blocked";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: dim ? 0.22 : 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative flex gap-3 rounded px-1 whitespace-nowrap ${blocked ? "font-semibold text-expensive" : ""}`}
    >
      {/* 새 줄 반짝임 — 오로라 색이 잠깐 깔렸다 사라짐 */}
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded bg-accent/20" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.6 }} />
      <time className="text-fg-2" dateTime={e.at}>
        {clockText(e.at)}
      </time>
      <span className="w-20 shrink-0">
        {KIND[e.kind].icon} {KIND[e.kind].name}
      </span>
      <span className="truncate">
        {e.label}
        {e.file && <span className="text-fg-2"> · {e.file}</span>}
        {e.ok === true && <span className="text-accent"> · 통과</span>}
        {e.ok === false && !blocked && <span className="text-expensive"> · 실패</span>}
      </span>
    </motion.li>
  );
}

function gateText(gate: { ok: boolean | null; at: string } | null) {
  if (!gate) return <span className="text-fg-2">최근 기록에 없음</span>;
  const when = <span className="text-fg-2"> · {clockText(gate.at)}</span>;
  if (gate.ok === true) return <>✅ 통과{when}</>;
  if (gate.ok === false) return <span className="text-expensive">❌ 실패{when}</span>;
  return <>결과 모름{when}</>;
}
