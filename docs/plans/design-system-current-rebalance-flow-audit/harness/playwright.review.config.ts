import { defineConfig, devices } from '@playwright/test'

// Audit-only harness for the current-rebalance/auction flow. Runs against the
// auditor's preview on 127.0.0.1:3047 with the repository's strict offline
// mocks and injected test wallet; never starts, reuses or stops a server.
const baseURL = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:3047'

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.review\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: '../evidence/harness-report.json' }],
  ],
  outputDir: '../evidence/harness-artifacts',
  use: {
    ...devices['Desktop Chrome'],
    deviceScaleFactor: 1,
    baseURL,
    actionTimeout: 5_000,
    navigationTimeout: 30_000,
    trace: 'off',
    screenshot: 'off',
  },
})
