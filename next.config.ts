import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 내보내기 → out/ 를 Cloudflare Pages 에 올린다 (docs/architecture.md)
  output: "export",
};

export default nextConfig;
