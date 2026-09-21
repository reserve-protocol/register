import { defineConfig, devices } from '@playwright/test'

// Real-fork lane: Register against a loopback Anvil fork. Nothing is intercepted:
// reads and writes hit the fork, the subgraph is whichever endpoint the chain
// profile names, the API is production unless VITE_RESERVE_API_URL points at a
// local one. Port 3006, never 3000 (Luis) or 3005 (offline suite). Fork reads are
// cold on first touch (seconds), so the timeouts are generous; the prepare
// scripts warm them.
//
//   FORK_CHAIN_ID=56 → BSC fork stack in e2e/fork/docker (CMC20 launcher lane)
//   FORK_CHAIN_ID=1  → the protocol sandbox (index-subgraph/.fork): Anvil :8545,
//                      fork subgraph :18000 (native 6.0.0 stack lane)
const HOST = '127.0.0.1'
const PORT = Number(process.env.FORK_WEB_PORT ?? 3006)
const baseURL = `http://${HOST}:${PORT}`
const chainId = process.env.FORK_CHAIN_ID ?? '56'
const defaults: Record<string, { rpc: string; subgraph: string }> = {
  '56': { rpc: 'http://127.0.0.1:8547', subgraph: 'http://127.0.0.1:18300' },
  '1': {
    rpc: 'http://127.0.0.1:8545',
    subgraph: 'http://127.0.0.1:18000/subgraphs/name/dtf-index-subgraph-fork',
  },
}
const profile = defaults[chainId]
if (!profile) throw new Error(`unsupported FORK_CHAIN_ID ${chainId}`)
const forkRpc = process.env[`FORK_RPC_URL_${chainId}`] ?? profile.rpc
const forkSubgraph =
  process.env[`FORK_SUBGRAPH_URL_${chainId}`] ?? profile.subgraph
const apiUrl = process.env.FORK_RESERVE_API_URL

export default defineConfig({
  testDir: './e2e/fork/tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 60_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report-fork' }],
  ],
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
      [`VITE_RPC_URL_${chainId}`]: forkRpc,
      [`VITE_INDEX_SUBGRAPH_URL_${chainId}`]: forkSubgraph,
      VITE_DISABLE_COWBOT: 'true',
      ...(apiUrl ? { VITE_RESERVE_API_URL: apiUrl } : {}),
    },
  },
})
