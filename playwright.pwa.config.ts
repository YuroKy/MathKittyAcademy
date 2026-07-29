import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-pwa',
  globalSetup: './e2e-pwa/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    serviceWorkers: 'allow',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'pwa-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
