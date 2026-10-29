import type { Metadata } from "next";
import { PricePage } from "@/features/travel-price/price-page";
import { api } from "@/shared/api";

export const metadata: Metadata = {
  title: "여행 물가 · Tripfx",
  description: "한국보다 물가가 싼 여행지 · 비싼 여행지 — 세계은행 물가 자료 · 오늘 그 나라 통화 신호",
};

// 물가 · 신호는 빌드 때 우리 API 에서 (매일 다시 빌드)
export default async function Page() {
  const [levels, signals] = await Promise.all([api.priceLevels(), api.signals()]);
  return <PricePage levels={levels} signals={signals} />;
}
