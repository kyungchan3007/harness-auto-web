"use client";

// 왼쪽 목록 — 찾기 · 지역 · `+ 통화` (누르면 그 통화 주소로 · 목록과 찾은 글자는 페이지를 옮겨도 그대로: 레이아웃에 있음)
// 휴대폰은 위에 가로로 넘기는 줄 · ☆ 를 누르면 즐겨찾기 — 맨 위로 · "즐겨찾기" 묶음 (이 브라우저에만 저장 · 작업 0089)
import { REGIONS, type Region, currencyName, currencyRegion, groupByRegion, matchCurrency } from "@hav/shared/currency";
import type { Signal } from "@hav/shared/signal";
import { signalLabel } from "@hav/ui/signal-badge";
import { Input } from "@hav/ui/field";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CurrencyFlag } from "../../shared/currency-flag";
import { favoritesFirst, useFavorites } from "./favorites";
import { codeFromPath } from "./route";

export type ListItem = { currency: string; signal: Signal | null };

const TONE: Record<Signal, string> = { cheap: "text-cheap", normal: "text-normal", expensive: "text-expensive" };

export function CurrencyList({ items }: { items: ListItem[] }) {
  const current = codeFromPath(usePathname());
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all" | "fav">("all");
  const [favs, toggleFav] = useFavorites();
  const regions = REGIONS.filter((r) => items.some((i) => currencyRegion(i.currency) === r.id));
  const chips = [{ id: "all" as const, label: "전체" }, ...(favs.length > 0 ? [{ id: "fav" as const, label: `★ 즐겨찾기 ${favs.length}` }] : []), ...regions];
  // 즐겨찾기를 다 빼서 그 묶음이 사라지면 전체로
  const picked = region === "fav" && favs.length === 0 ? "all" : region;
  const shown = favoritesFirst(groupByRegion(items).flatMap((g) => g.items), favs).filter(
    (i) => (picked === "all" || (picked === "fav" ? favs.includes(i.currency) : currencyRegion(i.currency) === picked)) && matchCurrency(i.currency, query),
  );

  return (
    <nav aria-label="통화 목록" className="min-w-0">
      <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="통화 · 나라 찾기" aria-label="통화 찾기" className="h-11 text-sm" />
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs lg:flex-wrap lg:overflow-visible" role="group" aria-label="지역">
        {chips.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            aria-pressed={picked === r.id}
            className={`shrink-0 rounded-pill px-3 py-1 font-semibold transition-colors ${picked === r.id ? "bg-accent text-on-accent" : "text-fg-2 hover:text-fg"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {/* 스크롤 영역 안쪽 여백 — 칸 테두리가 영역 끝에 붙어 잘려 보였음 (작업 0067) */}
      <ul className="mt-3 flex gap-2 overflow-x-auto p-0.5 pb-2 lg:max-h-[calc(100svh-14rem)] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {shown.map((i) => {
          const on = i.currency === current;
          const fav = favs.includes(i.currency);
          return (
            <li key={i.currency} className="flex shrink-0 items-stretch gap-1">
              <Link
                href={`/currencies/${i.currency}`}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={`flex flex-1 items-center gap-2 rounded-field border px-3 py-2.5 text-sm transition-colors ${on ? "border-accent bg-surface-2 text-fg" : "border-line text-fg-2 hover:border-fg-2 hover:text-fg"}`}
              >
                <span aria-hidden className="text-accent">
                  +
                </span>
                <CurrencyFlag currency={i.currency} className="h-3.5 w-5" />
                <span className="font-semibold">{currencyName(i.currency)}</span>
                <span className="text-xs">{i.currency}</span>
                {i.signal && <span className={`ml-auto pl-3 text-xs font-semibold ${TONE[i.signal]}`}>{signalLabel(i.signal)}</span>}
              </Link>
              <button
                type="button"
                onClick={() => toggleFav(i.currency)}
                aria-pressed={fav}
                aria-label={`${currencyName(i.currency)} 즐겨찾기${fav ? " 빼기" : ""}`}
                title={fav ? "즐겨찾기 빼기" : "즐겨찾기 — 목록 맨 위로"}
                className={`grid w-9 shrink-0 place-items-center rounded-field text-base transition-colors ${fav ? "text-accent" : "text-fg-2/60 hover:text-fg"}`}
              >
                <span aria-hidden>{fav ? "★" : "☆"}</span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-3 py-2.5 text-sm text-fg-2">찾는 통화가 없습니다</li>}
      </ul>
    </nav>
  );
}
