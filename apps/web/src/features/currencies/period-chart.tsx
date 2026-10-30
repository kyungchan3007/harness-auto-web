"use client";

// 환율 흐름 — 기간 단추(1개월 · 3개월 · 6개월 · 1년) + 선 그래프 + 그 기간 변화율 (작업 0087)
//   빌드 때 받은 1년치를 화면에서 자르기만 함 (다시 받지 않음)
import { useState } from "react";
import { YearChart } from "@/shared/year-chart";
import { PERIODS, type PeriodId, changeOf, changeText, sliceDays } from "./periods";

const TONE = { up: "text-expensive", down: "text-cheap", flat: "text-fg" } as const;

export function PeriodChart({ rates, unitText }: { rates: { date: string; baseRate: number }[]; unitText: string }) {
  const [id, setId] = useState<PeriodId>("1y");
  const period = PERIODS.find((p) => p.id === id) ?? PERIODS[3];
  const shown = sliceDays(rates, period.days);
  const change = changeOf(shown);
  const c = change ? changeText(change.pct) : null;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-fg">
          최근 {period.label} 흐름 <span className="font-normal text-fg-2">· 받은 {shown.length}일 (주말 · 휴일은 고시 없음)</span>
        </p>
        <div className="flex gap-1 rounded-full border border-line p-1" role="group" aria-label="기간">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === id}
              onClick={() => setId(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${p.id === id ? "bg-fg text-surface" : "text-fg-2 hover:text-fg"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <YearChart rates={shown} unitText={unitText} title={`${period.label} 흐름`} />
      {change && c && (
        <p className="mt-3 text-sm text-fg-2" aria-live="polite">
          {change.from.date} → {change.to.date} <span className={`font-semibold ${TONE[c.tone]}`}>{c.value}</span> · {period.label} 전보다 {c.text}
        </p>
      )}
    </div>
  );
}
