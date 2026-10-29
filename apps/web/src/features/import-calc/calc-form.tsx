"use client";

// 직구 계산기 화면 — 입력은 이 화면 상태에만 (보내지 않음 · 저장하지 않음 IMP-01) · 결과 옆에 환율 기준일 · 출처 (IMP-02) · "예상" 안내 (IMP-04)
import { currencyName, groupByRegion, SOURCE_NAME } from "@hav/shared/currency";
import type { FxRate } from "@hav/shared/fx";
import { useState, useSyncExternalStore } from "react";
import { PiggyLazy } from "../../shared/three-lazy";
import { type CalcInput, calc, piggyMood } from "./calc";
import { ROUTE_LABEL, RULES_SOURCE, type Route } from "./rules";

const MOOD_TEXT = { happy: "면세 한도 안이라 웃는 돼지", worried: "한도에 가까워 걱정하는 돼지", sad: "한도를 넘어 시무룩한 돼지", neutral: "기다리는 돼지" } as const;

export function CalcForm({ rates }: { rates: FxRate[] }) {
  const table = Object.fromEntries(rates.map((r) => [r.currency, r]));
  const codes = groupByRegion(rates).flatMap((g) => g.items.map((r) => r.currency));
  // /calc?currency=JPY (통화 둘러보기에서 옴) — 정적 페이지라 주소는 브라우저에서 읽음 (서버 그림은 달러)
  const fromUrl = useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).get("currency")?.toUpperCase() ?? "", () => "");
  const [picked, setInput] = useState<Partial<CalcInput>>({});
  const currency = picked.currency ?? (table[fromUrl] ? fromUrl : "USD");
  const input: CalcInput = { price: "", shipping: "", dutyRate: "", ...picked, currency, route: picked.route ?? (currency === "USD" ? "us-list" : "other") };
  const set = (k: keyof CalcInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setInput((i) => ({ ...i, [k]: e.target.value }));
  const started = input.price.trim() !== "";
  const r = started ? calc(input, table) : null;
  const mood = piggyMood(r);
  const rate = table[input.currency];
  const err = (f: string) => (r && !r.ok && r.field === f ? r.reason : null);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <form className="grid content-start gap-5" onSubmit={(e) => e.preventDefault()} aria-label="직구 계산 입력">
        <Field label="통화" htmlFor="currency">
          <select id="currency" value={input.currency} onChange={set("currency")} className={box}>
            {codes.map((c) => (
              <option key={c} value={c}>
                {currencyName(c)} {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="물건 값" hint="현지 세금 · 현지 배송비까지 넣은 값" htmlFor="price" error={err("price")}>
          <div className="relative">
            <input id="price" inputMode="decimal" autoComplete="off" value={input.price} onChange={set("price")} placeholder="180" className={`${box} pr-14`} />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-fg-2">{input.currency}</span>
          </div>
        </Field>
        <Field label="보내는 곳" hint="건강기능식품 · 의약품 등은 일반통관이라 150달러" htmlFor="route">
          <select id="route" value={input.route} onChange={set("route")} className={box}>
            {(Object.keys(ROUTE_LABEL) as Route[]).map((k) => (
              <option key={k} value={k}>
                {ROUTE_LABEL[k]} — 한도 {k === "us-list" ? 200 : 150}달러
              </option>
            ))}
          </select>
        </Field>
        <Field label="국제 배송비" hint="한도를 넘을 때만 세금에 더함 · 모르면 비워 두기" htmlFor="shipping" error={err("shipping")}>
          <input id="shipping" inputMode="decimal" autoComplete="off" value={input.shipping} onChange={set("shipping")} placeholder="0" className={box} />
        </Field>
        <Field label="관세율 (%)" hint="품목마다 다름 · 모르면 비워 두기" htmlFor="duty" error={err("dutyRate")}>
          <input id="duty" inputMode="decimal" autoComplete="off" value={input.dutyRate} onChange={set("dutyRate")} placeholder="모르면 비워 두기" className={box} />
          <a href={RULES_SOURCE.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-accent hover:underline">
            관세청에서 품목 세율 찾기 ↗
          </a>
        </Field>
      </form>

      <div className="rounded-card bg-surface-2 p-6 sm:p-8" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-fg-2">원화로</p>
            <p className="mt-1 text-[clamp(2rem,6vw,3.25rem)] leading-tight font-bold tracking-tighter">
              {r?.ok ? <span className="text-aurora">{r.priceKrw.toLocaleString("ko-KR")}</span> : <span className="text-fg-2">—</span>}
              <span className="ml-1.5 text-title font-semibold">원</span>
            </p>
          </div>
          <PiggyLazy mood={mood} label={MOOD_TEXT[mood]} className="size-28 shrink-0 sm:size-36" />
        </div>

        {!r && <p className="mt-6 text-base text-fg-2">물건 값을 넣으면 면세 한도 안인지 바로 보여 드립니다</p>}
        {r && !r.ok && <p className="mt-6 text-base font-semibold text-expensive">{r.reason}</p>}
        {r?.ok && (
          <>
            <div className="mt-6 h-2.5 overflow-hidden rounded-pill bg-surface" role="img" aria-label={`면세 한도의 ${Math.round(r.ratio * 100)}%`}>
              <div className={`h-full rounded-pill ${r.over ? "bg-expensive" : r.ratio >= 0.8 ? "bg-normal" : "bg-cheap"}`} style={{ width: `${Math.min(100, r.ratio * 100)}%` }} />
            </div>
            <p className="mt-3 text-base text-fg">
              면세 한도 {r.limitUsd}달러 중 {usd(r.priceUsd)}달러 ·{" "}
              {r.over ? (
                <span className="font-semibold text-expensive">{usd(r.priceUsd - r.limitUsd)}달러 넘음 · 세금 붙음</span>
              ) : (
                <span className="font-semibold text-cheap">{usd(r.leftUsd)}달러 남음 · 세금 없음</span>
              )}
            </p>
            {r.tax && (
              <dl className="mt-6 grid gap-2 border-t border-line pt-5 text-sm">
                <Row k="과세 가격 (물건 값 + 국제 배송비)" v={r.tax.taxableKrw} />
                <Row k={`관세 (${input.dutyRate || "?"}%)`} v={r.tax.duty} />
                <Row k="부가세 10% ((과세 가격 + 관세) × 10%)" v={r.tax.vat} />
                <Row k="모두 합쳐 예상" v={r.tax.total} strong />
                {r.tax.duty == null && <p className="text-fg-2">관세율을 넣으면 관세 · 부가세 · 합계를 계산합니다</p>}
              </dl>
            )}
          </>
        )}

        <ul className="mt-8 space-y-1 border-t border-line pt-5 text-xs text-fg-2">
          <li>
            예상 금액입니다. 실제 세액은 관세청 과세환율 · 품목 분류로 정해집니다 · 개별소비세 등 다른 세금 · 같은 날 여러 건 합산은 빼고 계산
          </li>
          <li>{rate ? `환율 ${rate.date} 기준 · ${SOURCE_NAME[rate.source]}` : "환율을 받지 못했습니다"} · 면세 한도: {RULES_SOURCE.name} ({RULES_SOURCE.checked} 확인)</li>
          <li>입력한 값은 이 화면 안에서만 계산하고 어디에도 보내지 않습니다</li>
        </ul>
      </div>
    </div>
  );
}

const noop = () => () => {};
const box = "w-full rounded-card border border-line bg-surface-2 px-4 py-3 text-base text-fg placeholder:text-fg-2 focus:border-accent focus:outline-none";
const usd = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });

function Field({ label, hint, htmlFor, error, children }: { label: string; hint?: string; htmlFor: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-fg">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-fg-2">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-sm text-expensive">{error}</p>}
    </div>
  );
}

function Row({ k, v, strong = false }: { k: string; v: number | null; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "pt-2 text-base font-semibold text-fg" : "text-fg-2"}`}>
      <dt>{k}</dt>
      <dd className="shrink-0 font-semibold text-fg">{v == null ? "—" : `${v.toLocaleString("ko-KR")}원`}</dd>
    </div>
  );
}
