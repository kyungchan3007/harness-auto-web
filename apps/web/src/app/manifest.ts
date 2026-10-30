import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/site";

// 홈 화면에 추가 (웹 앱 설명서) — 휴대폰에서 앱처럼 열림 · 아이콘은 app/icon.svg 를 PNG 로 그린 것 (작업 0091)
//   정적 내보내기라 빌드 때 한 번 만듦
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — 환율 · 여행 물가 · 직구 계산`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "통화 둘러보기", url: "/currencies" },
      { name: "여행 물가", url: "/prices" },
      { name: "직구 계산", url: "/calc" },
    ],
  };
}
