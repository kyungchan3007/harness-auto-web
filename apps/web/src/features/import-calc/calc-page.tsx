// 직구 계산기 페이지 — 밝은 섹션 (docs/design.md 홈 흐름 5) · 환율은 빌드 때 받은 값 · 계산은 브라우저에서
import type { Fetched } from "@/shared/api";
import { SiteNav } from "@/shared/site-nav";
import type { FxLatest } from "@hav/shared/fx";
import { CalcForm } from "./calc-form";

export function CalcPage({ latest }: { latest: Fetched<FxLatest> }) {
  return (
    <>
      <SiteNav page="calc" />
      <section data-surface="light" className="bg-surface px-4 pt-14 pb-24 text-fg sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-eyebrow font-semibold text-fg-2">직구 계산기</p>
          <h1 className="mt-3 text-title font-semibold tracking-tight">
            사기 전에,
            <br />
            세금이 붙는지 먼저.
          </h1>
          <div className="mt-10">
            {latest.ok && latest.data.rates.length > 0 ? (
              <CalcForm rates={latest.data.rates} />
            ) : (
              <div className="rounded-card border border-line p-8">
                <p className="text-lg font-semibold">자료 없음</p>
                <p className="mt-2 text-sm text-fg-2">환율을 받지 못해 계산할 수 없습니다 ({latest.ok ? "통화 없음" : latest.reason})</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
