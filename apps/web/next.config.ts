import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 내보내기 → out/ 를 Cloudflare Pages 에 올린다 (docs/architecture.md)
  output: "export",
  // next dev 가 AGENTS.md(보호 파일)를 자동으로 쓰지 않게 — 안내 블록은 루트 AGENTS.md 에서 손으로 관리
  agentRules: false,
};

export default nextConfig;
