import { defineConfig } from "drizzle-kit";

// 마이그레이션 파일만 만든다 (오프라인) — 적용은 wrangler d1 migrations apply
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
});
