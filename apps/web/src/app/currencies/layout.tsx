import type { Metadata } from "next";
import { BrowseLayout } from "@/features/currencies/browse-layout";
import { api } from "@/shared/api";

export const metadata: Metadata = {
  title: "통화 둘러보기 · Tripfx",
  description: "통화마다 오늘 환율 · 싼 편인지 · 최근 1년 흐름",
};

// 목록 · 동전은 여기 (통화를 바꿔도 그대로) · 빌드 때 API 에서
export default async function Layout({ children }: LayoutProps<"/currencies">) {
  const [latest, signals] = await Promise.all([api.latest(), api.signals()]);
  return (
    <BrowseLayout latest={latest} signals={signals}>
      {children}
    </BrowseLayout>
  );
}
