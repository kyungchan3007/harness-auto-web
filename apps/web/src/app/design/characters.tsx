"use client";

// 디자인 시스템 확인용 — 🐱 작업 고양이 · 💰 돈 든 고양이 표정을 버튼으로 바꿔 봄 (캔버스 두 개만)
import { MONEY_MOODS, type MoneyMood } from "@hav/ui/three/money-cat";
import { MOODS, type Mood } from "@hav/ui/three/worker-cat";
import { useState } from "react";
import { MoneyCatLazy, WorkerCatLazy } from "../../shared/three-lazy";

export function Characters() {
  const [work, setWork] = useState<Mood>("typing");
  const [money, setMoney] = useState<MoneyMood>("happy");
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Panel title="작업 고양이 (작업실)" moods={MOODS} current={work} onPick={setWork}>
        <WorkerCatLazy mood={work} label={`작업 고양이 · ${work}`} className="mx-auto size-72" />
      </Panel>
      <Panel title="돈 든 고양이 (직구 계산기)" moods={MONEY_MOODS} current={money} onPick={setMoney}>
        <MoneyCatLazy mood={money} label={`돈 든 고양이 · ${money}`} className="mx-auto size-72" />
      </Panel>
    </div>
  );
}

function Panel<M extends string>({ title, moods, current, onPick, children }: { title: string; moods: readonly M[]; current: M; onPick: (m: M) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface-2 p-6">
      <p className="text-base font-semibold text-fg">{title}</p>
      {children}
      <div className="mt-4 flex flex-wrap gap-2">
        {moods.map((m) => (
          <button key={m} type="button" onClick={() => onPick(m)} aria-pressed={m === current} className={`rounded-pill px-3 py-1 text-xs font-semibold ${m === current ? "bg-accent text-on-accent" : "text-fg-2 ring-1 ring-line"}`}>
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
