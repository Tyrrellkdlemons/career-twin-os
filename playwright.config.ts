import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  workers: 2,
  expect: { timeout: 10000 },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 5173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], baseURL, viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"], baseURL } }
  ]
});
