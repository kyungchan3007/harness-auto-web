import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/site";

// 검색 로봇 안내 — 모두 허용 · 개발용 /design 은 뺌 · sitemap 위치 (작업 0091 · 전엔 robots.txt 가 없었음)
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/design" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
