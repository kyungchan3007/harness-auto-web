import { defineConfig } from "vitest/config";

// 테스트 위치는 아키텍처 논의 뒤에 정한다 — 지금은 어디에 두든 *.test.ts 를 찾는다
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", "out/**", ".tmp/**"],
  },
});
