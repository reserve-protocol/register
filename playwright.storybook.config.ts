import { defineConfig, devices } from '@playwright/test'

const STORYBOOK_PORT = 6008

export default defineConfig({
  testDir: './e2e/storybook',
  outputDir: './test-results/storybook',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/storybook', open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${STORYBOOK_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'storybook-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --config .storybook/vite.config.ts --outDir storybook-static --host 127.0.0.1 --port ${STORYBOOK_PORT} --strictPort`,
    port: STORYBOOK_PORT,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
