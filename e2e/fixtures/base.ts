import { test as base } from '@playwright/test'
import { mockApiRoutes } from '../helpers/api-mocks'
import { mockSubgraphRoutes } from '../helpers/subgraph-mocks'
import { mockRpcRoutes } from '../helpers/rpc-mocks'

/**
 * Extended test fixture that auto-mocks all external network calls.
 * Every test gets mocked API, subgraph, and RPC responses automatically.
 *
 * Also dismisses the splash onboarding dialog and blocks unmocked external requests.
 */
export const test = base.extend<{ autoMock: void }>({
  autoMock: [
    async ({ page }, use) => {
      await mockApiRoutes(page)
      await mockSubgraphRoutes(page)
      await mockRpcRoutes(page)

      // Block external requests that could cause flaky timeouts or leak data
      await page.route('**/yields.llama.fi/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', data: [] }),
        })
      })
      await page.route('**/yields.reserve.org/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', data: [] }),
        })
      })

      // Merkl campaign API — prevents real network calls from overview page
      await page.route('**/api.merkl.xyz/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      })

      // Block Sentry error reporting during tests
      await page.route('**/sentry.io/**', (route) => route.abort())

      // Block image CDNs — prevents non-deterministic network calls
      await page.route('**/token-icons.llamao.fi/**', (route) => route.abort())
      await page.route('**/storage.reserve.org/**', (route) => route.abort())

      // Dismiss the splash onboarding dialog that shows on first visit.
      // The Splash component checks localStorage('splashVisible').
      await page.addInitScript(() => {
        localStorage.setItem('splashVisible', 'false')
      })

      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
