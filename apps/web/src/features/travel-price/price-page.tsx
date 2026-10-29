// 여행 물가 페이지 — 밝은 섹션 · 물가 · 환율 신호는 빌드 때 받은 값만 · 없으면 이유 (docs/domain/travel-price.md)
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { PriceLevels } from "@hav/shared/prices";
import type { SignalList } from "@hav/shared/signal";
import { TRAVEL_COUNTRIES, travelBands } from "@hav/shared/travel";
import { PriceBands } from "./price-bands";

export function PricePage({ levels, signals }: { levels: Fetched<PriceLevels>; signals: Fetched<SignalList> }) {
  const data = levels.ok ? travelBands(levels.data) : null;
  const signalOf = Object.fromEntries((signals.ok ? signals.data.signals : []).map((s) => [s.currency, s.signal]));
  const source = levels.ok ? levels.data.rows[0]?.source : null;

  return (
    <>
      <SiteNav page="prices" />
      <section data-surface="light" className="bg-surface px-4 pt-14 pb-24 text-fg sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-eyebrow font-semibold text-fg-2">여행 물가</p>
          <h1 className="mt-3 text-title font-semibold tracking-tight">
            같은 돈으로,
            <br />
            어디가 넉넉할까.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-fg-2">
            한국 물가를 기준으로 나라별 물가가 얼마나 싼지 · 비싼지 묶었습니다. 막대 가운데 선이 한국입니다. 오늘 그 나라 통화가 싼 편인지도 옆에 같이 적었습니다 — 두 값은
            따로 봅니다.
          </p>

          <div className="mt-10">
            {data && data.bands.length > 0 ? (
              <PriceBands bands={data.bands} signalOf={signalOf} latestYear={data.years[0]} />
            ) : (
              <div className="rounded-card border border-line p-8">
                <p className="text-lg font-semibold">자료 없음</p>
                <p className="mt-2 text-sm text-fg-2">물가 자료를 받지 못했습니다 ({levels.ok ? "여행지 나라 자료 없음" : levels.reason})</p>
              </div>
            )}
          </div>

          {data && (
            <div className="mt-12 space-y-2 border-t border-line pt-6 text-xs leading-relaxed text-fg-2">
              <p>
                출처: 세계은행 가계 소비 구매력 평가(PPP) ÷ 시장 환율 {source && <span className="font-mono">({source.replace(/^worldbank:/, "")})</span>} · 기준 연도{" "}
                {data.years.join(" · ")}년 · 한국과 같은 연도끼리 비교
              </p>
              <p>나라 전체 평균이라 도시 · 품목 · 숙소에 따라 체감은 다릅니다. 세계은행 안내대로 정밀한 순위 대신 묶음으로 보여 줍니다. 환율보다 늦게(1년에 한 번) 바뀝니다.</p>
              {data.missing.length > 0 && <p>자료가 없어 뺀 나라: {data.missing.map((c) => TRAVEL_COUNTRIES[c]?.name ?? c).join(" · ")}</p>}
              {!signals.ok && <p>오늘 환율 신호를 받지 못해 비워 두었습니다 ({signals.reason})</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
