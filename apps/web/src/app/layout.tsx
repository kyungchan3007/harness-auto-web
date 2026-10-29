import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/site";
import "./globals.css";

// 공유 미리보기 — 이미지는 app/opengraph-image.tsx · 페이지마다 제목 · 설명은 각 page 의 metadata (작업 0076)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-surface="dark">
      <body className="bg-surface text-fg">{children}</body>
    </html>
  );
}
