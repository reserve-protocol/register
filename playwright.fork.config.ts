import { defineConfig, devices } from '@playwright/test'

// Real-fork lane: Register against the per-chain Anvil fork in e2e/fork/docker.
// Nothing is intercepted — reads and writes hit the loopback fork, the Reserve
// API and the production subgraph are real. Port 3006, never 3000 (Luis) or
// 3005 (offline suite). Fork reads are cold on first touch (seconds), so the
// timeouts are generous; e2e/fork/scripts/prepare-cmc20.mjs warms them.
const HOST = '127.0.0.1'
const PORT = 3006
const baseURL = `http://${HOST}:${PORT}`
const forkRpc = process.env.FORK_RPC_URL_56 ?? 'http://127.0.0.1:8547'
// Production subgraph truncated at the fork block (e2e/fork/scripts/subgraph-proxy.mjs).
const forkSubgraph = process.env.FORK_SUBGRAPH_URL_56 ?? 'http://127.0.0.1:18300'

export default defineConfig({
  testDir: './e2e/fork/tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 60_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-fork' }]],
  outputDir: 'test-results-fork',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm exec vite --host ${HOST} --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_WALLETCONNECT_ID: 'test-project',
      VITE_RPC_URL_56: forkRpc,
      VITE_INDEX_SUBGRAPH_URL_56: forkSubgraph,
      VITE_DISABLE_COWBOT: 'true',
    },
  },
})
