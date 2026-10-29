"use client";

// 홈 흐름 2 "여행지 고르기" — 지구본은 화면에 고정 · 글 칸이 화면 가운데에 오면 그 도시로 돎 (docs/design.md)
// 숫자 · 신호는 빌드 때 받은 값만 · 없으면 "자료 없음" 글자 (FX-02 · TRV-02) · 3D 가 없어도 글은 그대로 읽힘
import { currencyName, rateText } from "@hav/shared/currency";
import type { FxRate } from "@hav/shared/fx";
import type { Signal } from "@hav/shared/signal";
import { TRAVEL_COUNTRIES, relativeText } from "@hav/shared/travel";
import { signalLabel } from "@hav/ui/signal-badge";
import type { Place } from "@hav/ui/three/geo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CurrencyFlag } from "@/shared/currency-flag";
import { GlobeLazy } from "@/shared/three-lazy";

export type TripStop = {
  place: Place & { country: string };
  rate: FxRate | null;
  signal: Signal | null;
  price: { relative: number; year: number } | null;
};

const TONE: Record<Signal, string> = { cheap: "text-cheap", normal: "text-normal", expensive: "text-expensive" };

export function TripScenes({ origin, stops }: { origin: Place; stops: TripStop[] }) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // 화면 세로 가운데 띠에 들어온 칸 = 지금 도시
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of steps.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative grid gap-0 lg:grid-cols-[1fr_1fr] lg:gap-10">
      {/* 휴대폰: 위에 고정 · 넓은 화면: 왼쪽에 고정 */}
      <div className="sticky top-13 z-0 h-[38svh] lg:h-[calc(100svh-3.25rem)]">
        <GlobeLazy
          className="h-full w-full"
          origin={origin}
          focus={stops[active]?.place ?? null}
          arcs={stops.map((s) => ({ to: s.place, tone: s.signal }))}
        />
      </div>
      <div className="relative z-10">
        {stops.map((s, i) => {
          const country = TRAVEL_COUNTRIES[s.place.country];
          const code = s.place.currency ?? "";
          const t = s.rate ? rateText(s.rate) : null;
          return (
            <article
              key={s.place.id}
              ref={(el) => {
                steps.current[i] = el;
              }}
              data-index={i}
              aria-current={i === active ? "step" : undefined}
              className="flex min-h-[70svh] items-end py-10 lg:min-h-[85svh] lg:items-center"
            >
              <div className={`w-full rounded-card bg-surface/80 p-6 backdrop-blur-md transition-opacity duration-500 sm:p-8 ${i === active ? "opacity-100" : "opacity-40"}`}>
                <p className="flex items-center gap-2 text-sm text-fg-2">
                  <CurrencyFlag currency={code} />
                  {s.place.name} · {country?.name ?? s.place.country}
                </p>
                <h3 className="mt-3 text-title font-semibold tracking-tight text-fg">
                  {currencyName(code)},{" "}
                  {s.signal ? <span className={TONE[s.signal]}>오늘은 {signalLabel(s.signal)}.</span> : <span className="text-fg-2">판단할 자료가 모자랍니다.</span>}
                </h3>
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-card bg-surface-2 p-4">
                    <dt className="text-xs text-fg-2">오늘 환율</dt>
                    <dd className="mt-1 text-base font-semibold whitespace-nowrap text-fg sm:text-lg">{t ? `${t.value}${t.unit}` : "자료 없음"}</dd>
                  </div>
                  <div className="rounded-card bg-surface-2 p-4">
                    <dt className="text-xs text-fg-2">물가 · 한국 대비</dt>
                    <dd className="mt-1 text-base font-semibold text-fg sm:text-lg">{s.price ? relativeText(s.price.relative) : "자료 없음"}</dd>
                    {s.price && <dd className="mt-0.5 text-xs text-fg-2">{s.price.year}년 · 세계은행</dd>}
                  </div>
                </dl>
                <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-accent">
                  <Link href={`/currencies/${code}`} className="hover:underline">
                    {currencyName(code)} 1년 흐름 →
                  </Link>
                  <Link href="/prices" className="hover:underline">
                    다른 나라 물가 →
                  </Link>
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
