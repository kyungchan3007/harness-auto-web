// 홈 — 빌드 때 받은 데이터로 그림 · 첫 화면(지구본) + 통화 전체를 지역별 탭으로
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { FxLatest } from "@hav/shared/fx";
import type { SignalList } from "@hav/shared/signal";
import { Card } from "@hav/ui/card";
import { Section } from "@hav/ui/section";
import { SignalBadge } from "@hav/ui/signal-badge";
import { Tabs } from "@hav/ui/tabs";
import { SOURCE_NAME, headline, percentileText, rateText } from "./copy";
import { currencyName, groupByRegion } from "./currencies";
import { Flag } from "./flag";
import { GlobeLazy } from "@/shared/three-lazy";
import { DESTINATIONS, SEOUL } from "./places";
import { CountUp } from "@hav/ui/count-up";
import { Reveal } from "@hav/ui/reveal";

const HERO = "USD";

export function Home({ latest, signals }: { latest: Fetched<FxLatest>; signals: Fetched<SignalList> }) {
  const rates = latest.ok ? latest.data.rates : [];
  const bySignal = new Map(signals.ok ? signals.data.signals.map((s) => [s.currency, s]) : []);
  const windowDays = signals.ok ? signals.data.rule.windowDays : 90;
  const hero = rates.find((r) => r.currency === HERO);
  const heroSignal = bySignal.get(HERO);
  const groups = groupByRegion(rates);
  const problem = !latest.ok ? latest.reason : !signals.ok ? signals.reason : null;

  return (
    <>
      <SiteNav page="home" />

      <Section id="today">
        <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        {hero ? (
          <Reveal>
            {/* 작은 제목은 큰 제목 바로 위에 붙임 — 섹션 위에 두면 지구본 높이만큼 떨어져 보였음 */}
            <p className="flex items-center gap-2 text-eyebrow font-semibold text-fg-2">
              <Flag currency={HERO} />
              오늘의 환율 · {hero.date} 기준 · {SOURCE_NAME[hero.source]}
            </p>
            <h1 className="mt-4 text-title font-semibold tracking-tight text-fg">{headline(HERO, heroSignal?.signal ?? null)}</h1>
            <p className="mt-6 text-hero font-bold tracking-tighter">
              <CountUp text={rateText(hero).value} className="text-aurora" />
              <span className="ml-3 text-title font-semibold text-fg">{rateText(hero).unit}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {heroSignal?.signal && <SignalBadge signal={heroSignal.signal} />}
              <span className="text-sm text-fg-2">{percentileText(heroSignal?.signal ?? null, heroSignal?.percentile ?? null, windowDays)} · 예측 아님</span>
            </div>
          </Reveal>
        ) : (
          <NoData reason={problem ?? "달러 환율이 아직 수집되지 않았습니다"} />
        )}
          {/* 🌏 호 색 = 그 나라 통화 신호 · 3D 가 안 되면 이 칸만 빔 (글자는 그대로) */}
          <GlobeLazy
            className="h-[320px] w-full sm:h-[420px] lg:h-[520px]"
            origin={SEOUL}
            arcs={DESTINATIONS.map((d) => ({ to: d, tone: bySignal.get(d.currency ?? "")?.signal ?? null }))}
          />
        </div>
      </Section>

      <Section id="currencies" surface="elevated" eyebrow={`모든 통화 · ${rates.length}개`} title={<>여행 · 직구 전에,<br />한눈에.</>}>
        {groups.length > 0 ? (
          <Tabs
            items={groups.map((g) => ({
              value: g.region,
              label: `${g.label} ${g.items.length}`,
              content: (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((r) => {
                    const s = bySignal.get(r.currency);
                    const t = rateText(r);
                    return (
                      <Card
                        key={r.currency}
                        title={
                          <span className="flex items-center gap-2">
                            <Flag currency={r.currency} />
                            {currencyName(r.currency)}
                            <span className="text-sm font-normal text-fg-2">{r.currency}</span>
                          </span>
                        }
                      >
                        <p className="text-3xl font-semibold tracking-tight text-fg">
                          {t.value}
                          <span className="ml-1 text-base font-medium text-fg-2">{t.unit}</span>
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {s?.signal && <SignalBadge signal={s.signal} />}
                          <span className="text-xs text-fg-2">{percentileText(s?.signal ?? null, s?.percentile ?? null, windowDays)}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ),
            }))}
          />
        ) : (
          <NoData reason={problem ?? "표시할 통화가 없습니다"} />
        )}
      </Section>

      <footer data-surface="dark" className="border-t border-line bg-surface px-4 py-10 text-xs text-fg-2 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-2">
          <p>신호는 최근 {windowDays}일 중 오늘 값의 위치입니다. 앞으로를 예측하지 않으며, 투자 · 금융 조언이 아닙니다.</p>
          <p>
            환율: 한국수출입은행 (예비: Frankfurter) · 화면에 보이는 값은 사이트를 만든 시점의 자료입니다 ·{" "}
            <a href="/log" className="text-accent hover:underline">
              🚧 이 사이트는 AI 코딩 에이전트가 만들고 있습니다
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

/** 숫자를 만들지 않고 이유를 보여 줌 (FX-02) */
function NoData({ reason }: { reason: string }) {
  return (
    <div className="rounded-card border border-line p-8">
      <p className="text-lg font-semibold text-fg">자료 없음</p>
      <p className="mt-2 text-sm text-fg-2">{reason}</p>
    </div>
  );
}
