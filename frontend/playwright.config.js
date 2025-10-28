import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...{ channel: 'chrome' },
        // Storage state is optional - only used if file exists
        // storageState: path.join(__dirname, 'tests/session-state.json')
      },
    }
  ],

  webServer: {
    command: 'bun run start',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  }
});
// NOTE: Playwright tests needed for 3 basic user flows: 1) Connect wallet, 2) Record audio and identify song, 3) Donate to artist
