import type { Metadata } from "next";
import { currencyName } from "@hav/shared/currency";
import { CurrencyDetail } from "@/features/currencies/currency-detail";
import { loadDetail } from "@/features/currencies/load";
import { DEFAULT_CODE } from "@/features/currencies/route";
import { api, mustHave } from "@/shared/api";

// 통화마다 정적 페이지 — API 가 준 통화 전부 (FX-03) · API 가 안 되면 달러 하나만 ("자료 없음")
export const dynamicParams = false;

export async function generateStaticParams() {
  const latest = mustHave(await api.latest(), "통화 목록");
  const codes = latest.ok && latest.data.rates.length > 0 ? latest.data.rates.map((r) => r.currency) : [DEFAULT_CODE];
  return codes.map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps<"/currencies/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: `${currencyName(code)} ${code} · 통화 둘러보기 · Tripfx` };
}

export default async function Page({ params }: PageProps<"/currencies/[code]">) {
  const { code } = await params;
  return <CurrencyDetail {...await loadDetail(code)} />;
}
