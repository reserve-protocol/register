import { cpus } from 'os'
import { defineConfig, devices } from '@playwright/test'

// Port 3005 — NEVER 3000 (Luis's own dev server lives there).
const HOST = '127.0.0.1'
const PORT = 3005
const baseURL = `http://${HOST}:${PORT}`

// Cap local workers at 5. Every worker's Chromium hits ONE Vite dev server +
// mock layer, which doesn't scale with cores — past ~5, the zap quote flows
// contend and flake without improving wall time (bound by the slowest chain,
// not raw parallelism). 3× full runs at 5 were flake-free vs an intermittent
// failure at the 7-worker default on a 14-core machine.
const localWorkers = Math.max(1, Math.min(5, cpus().length - 2))

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : localWorkers,
  timeout: 30_000,
  expect: { timeout: 7_500 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'full',
      grepInvert: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // `pnpm exec vite` (not `pnpm start --`) so --host/--port reach vite's CLI
    // and override vite.config's port 3000 — otherwise it boots on :3000, the
    // human's dev-server port.
    command: `pnpm exec vite --host ${HOST} --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Pin env so a developer's .env can't route around the mocks: staging flips
    // the API/zapper host, and RPC keys add hosts our intercept list won't match.
    env: {
      VITE_WALLETCONNECT_ID: 'test-project',
      VITE_STAGING_API: '',
      VITE_USE_STAGING: '',
      VITE_MAINNET_URL: '',
      VITE_INFURA: '',
      VITE_ALCHEMY: '',
      VITE_ANKR: '',
    },
  },
})
