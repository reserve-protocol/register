import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = Number(process.env.DESIGN_SYSTEM_PORT || 3022)
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error(
    'DESIGN_SYSTEM_PORT must be an integer port from 1024 to 65535'
  )
}
const externalBaseURL = process.env.DESIGN_SYSTEM_BASE_URL || undefined
const baseURL = externalBaseURL ?? `http://${host}:${port}`

export default defineConfig({
  testDir: './e2e/design-system',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  updateSnapshots: 'none',
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 7_500 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/design-system/report.json' }],
    [
      'html',
      { outputFolder: 'playwright-report/design-system', open: 'never' },
    ],
  ],
  outputDir: 'test-results/design-system/artifacts',
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm exec vite --host ${host} --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          VITE_E2E: 'true',
          VITE_WALLETCONNECT_ID: 'test-project',
          VITE_STAGING_API: '',
          VITE_USE_STAGING: '',
          VITE_MAINNET_URL: '',
          VITE_INFURA: '',
          VITE_ALCHEMY: '',
          VITE_ANKR: '',
        },
      },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'design-system-desktop',
      testIgnore: /(?:source-capture|lab-regressions)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 2600 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'design-system-mobile',
      testIgnore: /(?:source-capture|lab-regressions)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 3000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'design-system-phone',
      testIgnore: /(?:source-capture|lab-regressions)\.spec\.ts/,
      grep: /routes through/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'design-system-review',
      testMatch: /(?:source-capture|lab-regressions)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
  ],
})
