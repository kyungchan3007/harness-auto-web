// 홈 첫 화면 — 빌드 때 받은 데이터로 그림 (3D 는 다음 작업)
import type { Fetched } from "@/shared/api";
import type { FxLatest } from "@hav/shared/fx";
import type { SignalList } from "@hav/shared/signal";
import { Card } from "@hav/ui/card";
import { NavBar } from "@hav/ui/nav-bar";
import { Section } from "@hav/ui/section";
import { SignalBadge } from "@hav/ui/signal-badge";
import { CARD_CURRENCIES, SOURCE_NAME, currencyName, headline, percentileText, rateText } from "./copy";
import { GlobeLazy } from "../globe/globe-lazy";
import { DESTINATIONS } from "../globe/geo";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

const HERO = "USD";
const REPO = "https://github.com/kyungchan3007/harness-auto-web";

export function Home({ latest, signals }: { latest: Fetched<FxLatest>; signals: Fetched<SignalList> }) {
  const rates = latest.ok ? latest.data.rates : [];
  const bySignal = new Map(signals.ok ? signals.data.signals.map((s) => [s.currency, s]) : []);
  const windowDays = signals.ok ? signals.data.rule.windowDays : 90;
  const hero = rates.find((r) => r.currency === HERO);
  const heroSignal = bySignal.get(HERO);
  const cards = CARD_CURRENCIES.map((c) => rates.find((r) => r.currency === c)).filter((r) => r != null);
  const problem = !latest.ok ? latest.reason : !signals.ok ? signals.reason : null;

  return (
    <>
      <NavBar
        title="tripfx"
        links={[
          { href: "#today", label: "오늘 환율" },
          { href: "#currencies", label: "통화" },
          { href: REPO, label: "만드는 중" },
        ]}
        action={
          <a href="#currencies" className="inline-flex rounded-pill bg-accent px-4 py-1.5 text-xs font-semibold text-on-accent">
            통화 보기
          </a>
        }
      />

      <Section id="today" eyebrow={hero ? `오늘의 환율 · ${hero.date} 기준 · ${SOURCE_NAME[hero.source]}` : "오늘의 환율"}>
        <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        {hero ? (
          <Reveal>
            <h1 className="text-title font-semibold tracking-tight text-fg">{headline(HERO, heroSignal?.signal ?? null)}</h1>
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
            arcs={DESTINATIONS.map((d) => ({ currency: d.currency ?? "", signal: bySignal.get(d.currency ?? "")?.signal ?? null }))}
          />
        </div>
      </Section>

      <Section id="currencies" surface="elevated" eyebrow="다른 통화" title={<>여행 · 직구 전에,<br />한눈에.</>}>
        {cards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((r, i) => {
              const s = bySignal.get(r.currency);
              const t = rateText(r);
              return (
                <Reveal key={r.currency} delay={i * 0.06}>
                  <Card title={currencyName(r.currency)}>
                    <p className="text-3xl font-semibold tracking-tight text-fg">
                      {t.value}
                      <span className="ml-1 text-base font-medium text-fg-2">{t.unit}</span>
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {s?.signal && <SignalBadge signal={s.signal} />}
                      <span className="text-xs text-fg-2">{percentileText(s?.signal ?? null, s?.percentile ?? null, windowDays)}</span>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <NoData reason={problem ?? "표시할 통화가 없습니다"} />
        )}
      </Section>

      <footer data-surface="dark" className="border-t border-line bg-surface px-4 py-10 text-xs text-fg-2 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-2">
          <p>신호는 최근 {windowDays}일 중 오늘 값의 위치입니다. 앞으로를 예측하지 않으며, 투자 · 금융 조언이 아닙니다.</p>
          <p>
            환율: 한국수출입은행 (예비: Frankfurter) · 화면에 보이는 값은 사이트를 만든 시점의 자료입니다 ·{" "}
            <a href={REPO} className="text-accent hover:underline">
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
