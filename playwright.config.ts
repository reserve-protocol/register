import { defineConfig, devices } from '@playwright/test'

const HOST = '127.0.0.1'
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3000)
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: './e2e/tests',
  testIgnore: ['**/docs/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 7_500,
  },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    navigationTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },
  ],
  webServer: {
    command: `npm run start -- --host ${HOST} --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
