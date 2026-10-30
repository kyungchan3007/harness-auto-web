"use client";

// 여행 예산 어림 — 나라 · 한국에서 하루 쓰는 돈 · 일수 → 같은 생활이면 그 나라에서 하루 · 전체 (원 · 현지 통화) (작업 0088)
//   입력은 이 화면 상태에만 (보내지 않음) · 물가 기준 연도 · 환율 기준일을 같이 (TRV-01 · TRV-03)
import { currencyName } from "@hav/shared/currency";
import type { SignalList } from "@hav/shared/signal";
import { type TravelRow, relativeText } from "@hav/shared/travel";
import { Input, Select } from "@hav/ui/field";
import { useState } from "react";
import { budgetOf, localText, parseDaily, parseDays, wonText } from "./budget";

type Latest = SignalList["signals"][number]["latest"];

export function BudgetPlanner({ rows, latestOf }: { rows: TravelRow[]; latestOf: Record<string, Latest> }) {
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const [country, setCountry] = useState(rows.some((r) => r.country === "JPN") ? "JPN" : (sorted[0]?.country ?? ""));
  const [daily, setDaily] = useState("100,000");
  const [days, setDays] = useState("4");
  const row = rows.find((r) => r.country === country);
  const d = parseDaily(daily);
  const n = parseDays(days);
  const latest = row?.currency ? (latestOf[row.currency] ?? null) : null;
  const b = row && d != null && n != null ? budgetOf(d, n, row.relative, latest?.value ?? null) : null;

  return (
    <section aria-labelledby="budget-title" className="rounded-card bg-surface-2 p-5 sm:p-8">
      <h2 id="budget-title" className="text-lg font-semibold tracking-tight">
        여행 예산 어림
      </h2>
      <p className="mt-1 text-sm text-fg-2">한국에서 하루 이만큼 쓰는 생활이면, 그 나라에서는 얼마쯤 들까.</p>
      <form className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr_0.6fr]" onSubmit={(e) => e.preventDefault()}>
        <label className="grid gap-1.5">
          <span className="text-xs text-fg-2">나라</span>
          <Select value={country} onChange={(e) => setCountry(e.target.value)}>
            {sorted.map((r) => (
              <option key={r.country} value={r.country}>
                {r.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-fg-2">한국에서 하루 (원)</span>
          <Input inputMode="numeric" autoComplete="off" value={daily} onChange={(e) => setDaily(e.target.value)} aria-invalid={d == null} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-fg-2">일수</span>
          <Input inputMode="numeric" autoComplete="off" value={days} onChange={(e) => setDays(e.target.value)} aria-invalid={n == null} />
        </label>
      </form>

      <div className="mt-6" aria-live="polite">
        {!row ? null : d == null ? (
          <p className="text-sm text-expensive">하루 예산은 1원 이상의 정수로 넣어 주세요.</p>
        ) : n == null ? (
          <p className="text-sm text-expensive">일수는 1 ~ 90일로 넣어 주세요.</p>
        ) : (
          b && (
            <>
              <p className="text-sm text-fg-2">
                {row.name} 물가는 한국보다 <span className="font-semibold text-fg">{relativeText(row.relative)}</span> ({row.year}년)
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card bg-surface p-5">
                  <dt className="text-xs text-fg-2">하루</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight">약 {wonText(b.dailyWon)}</dd>
                  {b.dailyLocal != null && row.currency && <dd className="mt-0.5 text-sm text-fg-2">≈ {localText(b.dailyLocal, row.currency)}</dd>}
                </div>
                <div className="rounded-card bg-surface p-5">
                  <dt className="text-xs text-fg-2">{n}일 전체</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight">약 {wonText(b.totalWon)}</dd>
                  {b.totalLocal != null && row.currency && <dd className="mt-0.5 text-sm text-fg-2">≈ {localText(b.totalLocal, row.currency)}</dd>}
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-fg-2">
                {row.currency && latest
                  ? `${currencyName(row.currency)} 환산은 ${latest.date} 매매기준율 · `
                  : row.currency
                    ? `${currencyName(row.currency)} 오늘 환율을 받지 못해 원으로만 보여 줍니다 · `
                    : ""}
                나라 전체 가계 소비 평균(세계은행)이라 숙소 · 항공 · 도시에 따라 크게 다릅니다. 어림값입니다.
              </p>
            </>
          )
        )}
      </div>
    </section>
  );
}
