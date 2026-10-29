"use client";

// 왼쪽 목록 — 찾기 · 지역 · `+ 통화` (누르면 그 통화 주소로 · 목록과 찾은 글자는 페이지를 옮겨도 그대로: 레이아웃에 있음)
// 휴대폰은 위에 가로로 넘기는 줄
import { REGIONS, type Region, currencyName, currencyRegion, groupByRegion, matchCurrency } from "@hav/shared/currency";
import type { Signal } from "@hav/shared/signal";
import { signalLabel } from "@hav/ui/signal-badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CurrencyFlag } from "../../shared/currency-flag";
import { codeFromPath } from "./route";

export type ListItem = { currency: string; signal: Signal | null };

const TONE: Record<Signal, string> = { cheap: "text-cheap", normal: "text-normal", expensive: "text-expensive" };

export function CurrencyList({ items }: { items: ListItem[] }) {
  const current = codeFromPath(usePathname());
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const regions = REGIONS.filter((r) => items.some((i) => currencyRegion(i.currency) === r.id));
  const shown = groupByRegion(items)
    .flatMap((g) => g.items)
    .filter((i) => (region === "all" || currencyRegion(i.currency) === region) && matchCurrency(i.currency, query));

  return (
    <nav aria-label="통화 목록" className="min-w-0">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="통화 · 나라 찾기"
        aria-label="통화 찾기"
        className="w-full rounded-card border border-line bg-surface-2 px-4 py-2.5 text-sm text-fg placeholder:text-fg-2 focus:border-accent focus:outline-none"
      />
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs" role="group" aria-label="지역">
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
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:max-h-[calc(100svh-14rem)] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pr-1">
        {shown.map((i) => {
          const on = i.currency === current;
          return (
            <li key={i.currency} className="shrink-0">
              <Link
                href={`/currencies/${i.currency}`}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={`flex items-center gap-2 rounded-card px-3 py-2.5 text-sm ring-1 transition-colors ${on ? "bg-surface-2 text-fg ring-accent" : "text-fg-2 ring-line hover:text-fg"}`}
              >
                <span aria-hidden className="text-accent">
                  +
                </span>
                <CurrencyFlag currency={i.currency} className="h-3.5 w-5" />
                <span className="font-semibold">{currencyName(i.currency)}</span>
                <span className="text-xs">{i.currency}</span>
                {i.signal && <span className={`ml-auto pl-3 text-xs font-semibold ${TONE[i.signal]}`}>{signalLabel(i.signal)}</span>}
              </Link>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-3 py-2.5 text-sm text-fg-2">찾는 통화가 없습니다</li>}
      </ul>
    </nav>
  );
}
