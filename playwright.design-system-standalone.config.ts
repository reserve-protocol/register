import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = Number(process.env.DESIGN_SYSTEM_STANDALONE_PORT || 3055)
if (!Number.isInteger(port) || port < 3055 || port > 3065) {
  throw new Error(
    'DESIGN_SYSTEM_STANDALONE_PORT must be an integer from 3055 to 3065'
  )
}

const externalBaseURL =
  process.env.DESIGN_SYSTEM_STANDALONE_BASE_URL || undefined
const baseURL = externalBaseURL ?? `http://${host}:${port}`

export default defineConfig({
  testDir: './e2e/design-system',
  testMatch: 'standalone-entry.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 7_500 },
  reporter: [['list']],
  outputDir: 'test-results/design-system-standalone/artifacts',
  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm design-system:docs --host ${host} --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'standalone-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1400, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'standalone-mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
  ],
})
