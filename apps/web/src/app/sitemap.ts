import type { MetadataRoute } from "next";
import { api } from "@/shared/api";
import { PUBLIC_PAGES, SITE_URL } from "@/shared/site";

// 빌드 때 한 번 만듦 (정적 내보내기) · 통화 상세는 API 가 준 통화 전부 — 통화 페이지(generateStaticParams)와 같은 목록
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const latest = await api.latest();
  const codes = latest.ok ? latest.data.rates.map((r) => r.currency) : [];
  return [
    ...PUBLIC_PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "daily" as const, priority: p === "/" ? 1 : 0.8 })),
    ...codes.map((c) => ({ url: `${SITE_URL}/currencies/${c}`, changeFrequency: "daily" as const, priority: 0.5 })),
  ];
}
