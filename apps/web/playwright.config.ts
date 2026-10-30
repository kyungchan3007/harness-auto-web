import { defineConfig, devices } from "@playwright/test";

// e2e — 빌드한 정적 사이트(out)를 기기 Chrome 으로 (브라우저를 따로 받지 않음 · GitHub 러너에도 Chrome 이 있음) (작업 0101)
//   게이트 Full 루프가 build 다음에 test:e2e 로 돌림
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4399", channel: "chrome", trace: "off" },
  projects: [
    { name: "넓은 화면", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "휴대폰", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: { command: "node e2e/serve.mjs", url: "http://127.0.0.1:4399/", reuseExistingServer: !process.env.CI, timeout: 20_000 },
});
