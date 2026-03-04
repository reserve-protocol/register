import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Capture screenshot on test failure for debugging */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
      // Only run responsive test files on mobile
      testMatch: /responsive/,
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
      // Only run responsive test files on tablet
      testMatch: /responsive/,
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    // {
    //   command: [
    //     `anvil`,
    //     `--fork-block-number=18180527`,
    //     `--fork-url=https://eth.llamarpc.com`,
    //     `--balance 100000000`,
    //   ].join(' '),
    //   port: 8545,
    //   reuseExistingServer: !process.env.CI,
    // },
    {
      command: 'npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
