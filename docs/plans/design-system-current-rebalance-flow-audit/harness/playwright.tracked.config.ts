import { defineConfig, devices } from '@playwright/test'

// Runs the repository's OWN auction specs unchanged against the auditor's
// preview on 127.0.0.1:3047 (the main config would try to start a server on
// 3005, which belongs to the user). One worker, no retries, no server control.
const baseURL = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:3047'

export default defineConfig({
  testDir: '../../../../e2e/tests',
  testMatch: [
    /flows\/auctions\.spec\.ts$/,
    /flows\/auctions-multichain\.spec\.ts$/,
    /index-dtf\/auctions\/.*\.spec\.ts$/,
    /smoke\/auctions\.spec\.ts$/,
  ],
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 7_500 },
  reporter: [
    ['list'],
    ['json', { outputFile: '../evidence/tracked-report.json' }],
  ],
  outputDir: '../evidence/tracked-artifacts',
  use: { baseURL, trace: 'off', screenshot: 'off' },
  projects: [
    { name: 'smoke', grep: /@smoke/, use: { ...devices['Desktop Chrome'] } },
    { name: 'full', grepInvert: /@smoke/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', grep: /@mobile/, use: { ...devices['Pixel 7'] } },
  ],
})
