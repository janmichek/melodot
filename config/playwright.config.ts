import {defineConfig, devices} from '@playwright/test'

// Keep the browser suite deterministic; the live Web3Auth modal is a manual
// smoke test, not a CI dependency.
process.env.VITE_E2E ??= '1'

// Optional CPU throttle for local recording runs. CDP rate 1.176 ~= 85% CPU.
const throttle = Number(process.env.PLAYWRIGHT_CPU_THROTTLE ?? 0)

export default defineConfig({
  testDir: '../tests',
  outputDir: '../test-results',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ['line'],
    ['html', {open: 'never', outputFolder: '../playwright-report'}],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: {width: 1440, height: 900},
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.PLAYWRIGHT_VIDEO === 'on' ? 'retain-on-failure' : 'off',
    launchOptions: {slowMo: process.env.SLOW_MO ? 100 : 0},
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(throttle > 0 ? {viewport: {width: 1440, height: 900}} : {}),
      },
    },
  ],
  webServer: {
    // Deterministic Web3Auth mock: CI has no dashboard project config.
    command: 'VITE_E2E=1 bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
