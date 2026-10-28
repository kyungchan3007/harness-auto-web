import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "harness-auto-web",
  description: "환율 · 물가를 매일 받아 여행 · 직구 타이밍을 보여 주는 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
