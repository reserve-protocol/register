import { defineConfig } from '@playwright/test'

const host = '127.0.0.1'
const port = Number(process.env.DESIGN_SYSTEM_COMPONENTS_PORT || 3059)
if (!Number.isInteger(port) || port < 3058 || port > 3065) {
  throw new Error(
    'DESIGN_SYSTEM_COMPONENTS_PORT must be an integer from 3058 to 3065'
  )
}

const baseURL = `http://${host}:${port}`

export default defineConfig({
  testDir: './e2e/design-system',
  testMatch: 'components-documentation.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 7_500 },
  reporter: [['list']],
  outputDir: 'test-results/design-system-components/artifacts',
  webServer: {
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
})
