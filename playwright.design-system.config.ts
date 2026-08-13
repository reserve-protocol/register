import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = 3005
const externalBaseURL = process.env.DESIGN_SYSTEM_BASE_URL
const baseURL = externalBaseURL ?? `http://${host}:${port}`

export default defineConfig({
  testDir: './e2e/design-system',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 7_500 },
  reporter: [['list']],
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
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 2600 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'design-system-mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 3000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'design-system-phone',
      grep: /routes through/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
  ],
})
