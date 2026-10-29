// 통화 둘러보기 — 왼쪽 `+ 통화` 목록 → 가운데 🪙 동전 · 상세 (docs/design.md 페이지 패턴 "둘러보기")
// 목록 · 동전은 레이아웃이라 통화를 바꿔도 남고, 상세(children)만 바뀜
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { FxLatest } from "@hav/shared/fx";
import type { SignalList } from "@hav/shared/signal";
import type { ReactNode } from "react";
import { CoinSlot } from "./coin-slot";
import { CurrencyList } from "./currency-list";

export function BrowseLayout({ latest, signals, children }: { latest: Fetched<FxLatest>; signals: Fetched<SignalList>; children: ReactNode }) {
  const tones = Object.fromEntries((signals.ok ? signals.data.signals : []).map((s) => [s.currency, s.signal]));
  const items = (latest.ok ? latest.data.rates : []).map((r) => ({ currency: r.currency, signal: tones[r.currency] ?? null }));
  const windowDays = signals.ok ? signals.data.rule.windowDays : 90;

  return (
    <>
      <SiteNav page="currencies" />
      <section data-surface="dark" className="bg-surface px-4 pt-10 pb-24 text-fg sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-eyebrow font-semibold text-fg-2">통화 둘러보기 · {items.length}개</p>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
            <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
              <CurrencyList items={items} />
            </div>
            <div className="grid gap-6 rounded-card bg-surface-2/40 p-5 ring-1 ring-line sm:p-8 grid-cols-[minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
              <div className="flex justify-center md:block">
                <CoinSlot signals={tones} />
              </div>
              {children}
            </div>
          </div>
        </div>
      </section>
      <footer data-surface="dark" className="border-t border-line bg-surface px-4 py-10 text-xs text-fg-2 sm:px-8">
        <div className="mx-auto max-w-6xl">신호는 최근 {windowDays}일 중 오늘 값의 위치입니다. 앞으로를 예측하지 않으며, 투자 · 금융 조언이 아닙니다 · 환율: 한국수출입은행 (예비: Frankfurter)</div>
      </footer>
    </>
  );
}
