// 오른쪽 상세 — 오늘 환율 · 신호 · 환율 계산기(작업 0086) · 기간별 흐름(작업 0087) · 최저 · 최고 · 환산 예시 (빌드 때 받은 값만 · 없으면 이유)
import type { Fetched } from "@/shared/api";
import { SOURCE_NAME, currencyName, percentileText, rangeOf, rateText, sampleText, toUnit } from "@hav/shared/currency";
import type { FxHistory, FxRate } from "@hav/shared/fx";
import type { CurrencySignal } from "@hav/shared/signal";
import { TRAVEL_COUNTRIES, countriesOf } from "@hav/shared/travel";
import { SignalBadge } from "@hav/ui/signal-badge";
import { CurrencyFlag } from "@/shared/currency-flag";
import { FreshnessNote } from "@/shared/freshness-note";
import { Converter } from "./converter";
import { describeCurrency } from "./describe";
import { PeriodChart } from "./period-chart";
import { ShareButton } from "./share-button";

export type DetailData = { code: string; rate: FxRate | null; signal: Fetched<CurrencySignal>; history: Fetched<FxHistory>; problem: string | null };

export function CurrencyDetail({ code, rate, signal, history, problem }: DetailData) {
  const name = currencyName(code);
  if (!rate) {
    return (
      <div className="rounded-card border border-line p-8">
        <p className="text-lg font-semibold text-fg">자료 없음</p>
        <p className="mt-2 text-sm text-fg-2">{problem ?? `${name}(${code}) 환율이 아직 수집되지 않았습니다`}</p>
      </div>
    );
  }
  const t = rateText(rate);
  const s = signal.ok ? signal.data : null;
  const days = history.ok ? toUnit(history.data.rates, rate.unit) : [];
  const range = rangeOf(days);

  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2 text-sm text-fg-2">
        <CurrencyFlag currency={code} />
        <span className="font-semibold text-fg">{name}</span> {code} · {rate.date} 기준 · {SOURCE_NAME[rate.source]}
        <span className="ml-auto">
          <ShareButton title={`${name} ${code} 환율 · Tripfx`} text={describeCurrency(code, rate, s?.signal ?? null)} />
        </span>
      </p>
      <FreshnessNote date={rate.date} className="mt-1" />
      <h1 className="mt-3 text-[clamp(2.5rem,7vw,4.5rem)] leading-none font-bold tracking-tighter">
        <span className="text-aurora">{t.value}</span>
        <span className="ml-2 text-title font-semibold text-fg">{t.unit}</span>
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {s?.signal && <SignalBadge signal={s.signal} />}
        <span className="text-sm text-fg-2">
          {s ? percentileText(s.signal, s.percentile, s.rule.windowDays) : `신호를 받지 못했습니다 (${signal.ok ? "" : signal.reason})`} · 예측 아님
        </span>
      </div>

      <div className="mt-8">
        <Converter code={code} rate={rate} />
      </div>

      <div className="mt-10">
        {history.ok ? <PeriodChart rates={days} unitText={t.unit} /> : <p className="rounded-card border border-line p-6 text-sm text-fg-2">1년 기록을 받지 못했습니다 ({history.reason})</p>}
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <Stat label="1년 최저" value={range ? rateText({ baseRate: range.min.baseRate, unit: rate.unit }).value : "—"} sub={range && `${t.unit} · ${range.min.date}`} />
        <Stat label="1년 최고" value={range ? rateText({ baseRate: range.max.baseRate, unit: rate.unit }).value : "—"} sub={range && `${t.unit} · ${range.max.date}`} />
        <Stat label="환산 예시" value={sampleText(code, rate).split(" → ")[1]} sub={sampleText(code, rate).split(" → ")[0]} />
      </dl>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-accent">
        <a href={`/calc?currency=${code}`} className="hover:underline">
          이 통화로 직구 계산하기 →
        </a>
        {countriesOf(code).length === 1 && (
          <a href={`/prices?country=${countriesOf(code)[0]}#budget`} className="hover:underline">
            {TRAVEL_COUNTRIES[countriesOf(code)[0]]?.name} 여행 예산 어림 →
          </a>
        )}
        {countriesOf(code).length > 0 && (
          <a href="/prices" className="hover:underline">
            {countriesOf(code).length === 1 ? `${TRAVEL_COUNTRIES[countriesOf(code)[0]]?.name} 물가 보기` : "이 통화 쓰는 나라 물가 보기"} →
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div className="rounded-card bg-surface-2 p-5">
      <dt className="text-xs text-fg-2">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-fg">{value}</dd>
      {sub && <dd className="mt-0.5 text-xs text-fg-2">{sub}</dd>}
    </div>
  );
}
