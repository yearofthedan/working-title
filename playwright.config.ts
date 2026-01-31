import { defineConfig, devices } from '@playwright/test'

const timeOuts = process.env.CI
  ? {}
  : {
      timeout: 60000, // Total test time
      expect: {
        timeout: 20000, // Time to wait for UI elements
      },
    }

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  ...timeOuts,

  reporter: 'html',
  outputDir: 'test-results/',
  use: {
    headless: true,
    launchOptions: {
      slowMo: 100, // Delays every action by 100ms
    },
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: './do preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
      },
})
