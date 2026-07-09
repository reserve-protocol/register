import { test as base } from '@playwright/test'
import { DEFAULT_GEOLOCATION, mockApiRoutes, type GeolocationStatus } from '../helpers/api'
import type { UnmockedLogger } from '../helpers/logger'
import { MockOverrides } from '../helpers/overrides'
import { mockRpcRoutes, setMockNow } from '../helpers/rpc'
import { mockSubgraphRoutes } from '../helpers/subgraph'

export interface BaseFixtures {
  // Compliance geolocation returned by the API mock. Override per-spec for
  // restricted-region tests: test.use({ compliance: {...} }). Named `compliance`
  // (not `geolocation`) to avoid clashing with Playwright's built-in geolocation.
  compliance: GeolocationStatus
  // Per-test overlay every mock consults before its snapshots — lets a spec
  // change a boundary response mid-test (post-tx state). Fresh per test.
  overrides: MockOverrides
  // Every `[E2E] unmocked ...` line collected during the test. @smoke tests fail
  // at teardown if this is non-empty; flow tests only attach it to the report.
  unmockedCalls: string[]
}

async function fulfillEmpty(route: import('@playwright/test').Route, body: unknown = {}) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export const test = base.extend<BaseFixtures>({
  compliance: [DEFAULT_GEOLOCATION, { option: true }],

  // Fresh per test — a new instance means overrides never leak between tests.
  // oxlint-disable-next-line no-empty-pattern -- Playwright derives fixture deps from the destructuring pattern; {} = no deps
  overrides: async ({}, use) => {
    await use(new MockOverrides())
  },

  unmockedCalls: [
    async ({ page, compliance, overrides }, use, testInfo) => {
      const calls: string[] = []
      const log: UnmockedLogger = (message, detail) => {
        const line = `[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`
        calls.push(line)
        console.error(line)
      }

      // Boundaries we answer.
      await mockRpcRoutes(page, log, overrides)
      await mockSubgraphRoutes(page, log, overrides)
      await mockApiRoutes(page, { log, geolocation: compliance, overrides })

      // WalletConnect / relay / explorer: fulfill empty (NOT abort) — connectors
      // init eagerly on mount and aborts surface unhandled rejections.
      await page.route('**walletconnect.com**', (r) => fulfillEmpty(r))
      await page.route('**walletconnect.org**', (r) => fulfillEmpty(r))
      await page.route('**web3modal.org**', (r) => fulfillEmpty(r))
      await page.route('**reown.com**', (r) => fulfillEmpty(r))

      // Yield/reward aggregators the overview polls.
      await page.route('**yields.llama.fi**', (r) => fulfillEmpty(r, { status: 'success', data: [] }))
      await page.route('**api.llama.fi**', (r) => fulfillEmpty(r, { status: 'success', data: [] }))
      await page.route('**yields.reserve.org**', (r) => fulfillEmpty(r, { status: 'success', data: [] }))
      await page.route('**api.merkl.xyz**', (r) => fulfillEmpty(r, []))

      // Analytics — abort is safe, they are fire-and-forget beacons.
      await page.route('**sentry.io**', (r) => r.abort())
      await page.route('**mixpanel.com**', (r) => r.abort())
      await page.route('**segment.io**', (r) => r.abort())

      // Image CDNs — abort to avoid non-deterministic network.
      await page.route('**token-icons.llamao.fi**', (r) => r.abort())
      await page.route('**storage.reserve.org**', (r) => r.abort())

      // Deterministic app boot: skip splash, pin locale to en (accessible names
      // are Lingui-translated, so tests must run in a known language).
      await page.addInitScript(() => {
        localStorage.setItem('splashVisible', 'false')
        localStorage.setItem('register.locale', 'en')
      })

      await use(calls)

      // Frozen mock time is a per-worker singleton (set by freezeTime) — reset
      // so it can't leak into the next test.
      setMockNow(undefined)

      if (calls.length) {
        await testInfo.attach('unmocked-calls', {
          body: calls.join('\n'),
          contentType: 'text/plain',
        })
      }
      // A green smoke run must be trustworthy without reading logs.
      if (testInfo.tags.includes('@smoke') && calls.length) {
        throw new Error(
          `@smoke test hit ${calls.length} unmocked call(s):\n${calls.join('\n')}`
        )
      }
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
