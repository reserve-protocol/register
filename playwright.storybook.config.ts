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
    {
      name: 'storybook-mobile-webkit',
      testMatch: [
        'pilot-accessibility.spec.ts',
        'proposal-patterns.spec.ts',
        'dialog-simulation.spec.ts',
        'dialog-information.spec.ts',
        'dialog-information-layout.spec.ts',
        'dialog-tokenized-asset.spec.ts',
        'progress-indicator.spec.ts',
        'proposal-progress*.spec.ts',
      ],
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --config .storybook/vite.config.ts --outDir storybook-static --host 127.0.0.1 --port ${STORYBOOK_PORT} --strictPort`,
    port: STORYBOOK_PORT,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
