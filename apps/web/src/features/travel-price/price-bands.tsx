"use client";

// 묶음별 나라 목록 — 지역 고르기 · 막대(가운데 선 = 한국) · 오늘 통화 신호 (색만으로 전하지 않고 글자도)
import { REGIONS, type Region, currencyName } from "@hav/shared/currency";
import type { Signal } from "@hav/shared/signal";
import { type Band, type TravelRow, relativeText } from "@hav/shared/travel";
import { Flag } from "@hav/ui/flag";
import { signalLabel } from "@hav/ui/signal-badge";
import Link from "next/link";
import { useState } from "react";

const BAR: Record<Band, string> = { cheap: "bg-cheap", similar: "bg-normal", pricey: "bg-expensive" };
const TONE: Record<Signal, string> = { cheap: "text-cheap", normal: "text-normal", expensive: "text-expensive" };

type Props = { bands: { id: Band; label: string; rows: TravelRow[] }[]; signalOf: Record<string, Signal | null>; latestYear?: number };

export function PriceBands({ bands, signalOf, latestYear }: Props) {
  const [region, setRegion] = useState<Region | "all">("all");
  const all = bands.flatMap((b) => b.rows);
  const regions = REGIONS.filter((r) => all.some((c) => c.region === r.id));
  // 막대 길이 = 한국 대비 · 가장 비싼 나라가 끝 · 한국(1)은 가운데 근처 선
  const max = Math.max(2, ...all.map((r) => r.relative));
  const korea = `${(1 / max) * 100}%`;
  const shown = bands.map((b) => ({ ...b, rows: b.rows.filter((r) => region === "all" || r.region === region) })).filter((b) => b.rows.length > 0);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs" role="group" aria-label="지역">
        {[{ id: "all" as const, label: "전체" }, ...regions].map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            aria-pressed={region === r.id}
            className={`shrink-0 rounded-pill px-3 py-1 font-semibold transition-colors ${region === r.id ? "bg-accent text-on-accent" : "text-fg-2 hover:text-fg"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        {shown.map((b) => (
          <section key={b.id} aria-labelledby={`band-${b.id}`} className="min-w-0 rounded-card border border-line p-5 sm:p-6">
            <h2 id={`band-${b.id}`} className="flex items-baseline justify-between gap-2 text-base font-semibold">
              {b.label}
              <span className="text-xs font-normal text-fg-2">{b.rows.length}곳</span>
            </h2>
            <ul className="mt-4 space-y-4">
              {b.rows.map((r) => {
                const signal = r.currency ? signalOf[r.currency] : null;
                return (
                  <li key={r.country} className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Flag country={r.flag} label={`${r.name} 국기`} className="h-3.5 w-5 shrink-0" />
                      <span className="font-semibold">{r.name}</span>
                      <span className="ml-auto shrink-0 font-semibold tabular-nums">{relativeText(r.relative)}</span>
                    </div>
                    <div className="relative mt-1.5 h-1.5 rounded-pill bg-surface-2" aria-hidden>
                      <div className={`h-full rounded-pill ${BAR[r.band]}`} style={{ width: `${Math.min(100, (r.relative / max) * 100)}%` }} />
                      <div className="absolute -top-1 -bottom-1 w-px bg-fg" style={{ left: korea }} />
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-fg-2">
                      {r.year !== latestYear && <span>{r.year}년 자료</span>}
                      {r.currency && signal ? (
                        <Link href={`/currencies/${r.currency}`} className="hover:text-fg">
                          오늘 {currencyName(r.currency)} <span className={`font-semibold ${TONE[signal]}`}>{signalLabel(signal)}</span> →
                        </Link>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
