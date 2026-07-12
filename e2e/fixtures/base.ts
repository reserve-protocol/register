import { test as base } from '@playwright/test'
import { DEFAULT_GEOLOCATION, mockApiRoutes, type GeolocationStatus } from '../helpers/api'
import type { UnmockedLogger } from '../helpers/logger'
import { MockOverrides } from '../helpers/overrides'
import { resetFrozenTime } from '../helpers/clock'
import type { TxRecord } from '../helpers/provider'
import type { BoundaryRequest } from '../helpers/requests'
import { mockRpcRoutes, setMockNow, setYieldReplay } from '../helpers/rpc'
import { mockSubgraphRoutes } from '../helpers/subgraph'

export interface BaseFixtures {
  // Compliance geolocation returned by the API mock. Override per-spec for
  // restricted-region tests: test.use({ compliance: {...} }). Named `compliance`
  // (not `geolocation`) to avoid clashing with Playwright's built-in geolocation.
  compliance: GeolocationStatus
  // Per-test overlay every mock consults before its snapshots — lets a spec
  // change a boundary response mid-test (post-tx state). Fresh per test.
  overrides: MockOverrides
  // Every `[E2E] unmocked ...` line collected during the test. Tests fail at
  // teardown if this is non-empty (opt out per-spec with allowUnmocked).
  unmockedCalls: string[]
  // Every submitted transaction, appended by the wallet provider's
  // eth_sendTransaction. Empty for tests that never install the wallet. Fresh per
  // test — specs assert payloads (to / decoded fn / approval spender) off it.
  txLog: TxRecord[]
  // Every handled API/subgraph/RPC request. Tests use this to prove source,
  // identity, parameters, and request counts rather than only rendered shells.
  boundaryRequests: BoundaryRequest[]
  // Escape hatch for genuinely exploratory specs: when true, unmocked calls are
  // still logged/attached but don't fail the test. Default false — a committed
  // migration flow must fail on any unmocked RPC/API/subgraph/egress call.
  allowUnmocked: boolean
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
  allowUnmocked: [false, { option: true }],

  // Fresh per test — a new instance means overrides never leak between tests.
  // oxlint-disable-next-line no-empty-pattern -- Playwright derives fixture deps from the destructuring pattern; {} = no deps
  overrides: async ({}, use) => {
    await use(new MockOverrides())
  },

  // Fresh array per test — the wallet provider appends to it on each send.
  // oxlint-disable-next-line no-empty-pattern -- {} = no deps (Playwright reads deps from the pattern)
  txLog: async ({}, use) => {
    await use([])
  },

  // oxlint-disable-next-line no-empty-pattern -- {} = no deps
  boundaryRequests: async ({}, use) => {
    await use([])
  },

  unmockedCalls: [
    async (
      { page, compliance, overrides, txLog, boundaryRequests, allowUnmocked },
      use,
      testInfo
    ) => {
      const calls: string[] = []
      const log: UnmockedLogger = (message, detail) => {
        const line = `[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`
        calls.push(line)
        console.error(line)
      }

      // Register the catch-all FIRST. Playwright gives later, more-specific
      // routes precedence; anything not claimed below reaches this default-deny
      // boundary instead of escaping to the network.
      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url())
        if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
          return route.fallback()
        }
        const inertHosts = [
          'assets.coingecko.com',
          'connect.facebook.net',
          'dd.dexscreener.com',
          'raw.githubusercontent.com',
          'www.googletagmanager.com',
        ]
        // Remote visual assets and trackers are intentionally inert in E2E. They do not
        // carry product data and Playwright assertions use local structure,
        // alt text, and values rather than live pixels.
        if (
          route.request().resourceType() === 'image' ||
          inertHosts.includes(url.hostname) ||
          url.hostname.endsWith('.ufs.sh') ||
          (url.hostname === 'app.reserve.org' && url.pathname.startsWith('/svgs/')) ||
          (url.hostname === 'app2.universal.xyz' && url.pathname.startsWith('/wrapped-tokens/'))
        ) {
          return route.abort()
        }
        log('unmocked egress', {
          method: route.request().method(),
          url: `${url.origin}${url.pathname}`,
        })
        return route.fulfill({
          status: 502,
          contentType: 'application/json',
          body: JSON.stringify({ error: '[E2E] outbound request is not allowlisted' }),
        })
      })

      // Boundaries we answer.
      await mockRpcRoutes(page, log, overrides, txLog, boundaryRequests)
      await mockSubgraphRoutes(page, log, overrides, boundaryRequests)
      await mockApiRoutes(page, {
        log,
        geolocation: compliance,
        overrides,
        requests: boundaryRequests,
      })

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

      // Tenderly simulation stays DEFAULT-DENIED (audit P1): a blanket fulfill
      // silently accepts any malformed/new simulation request, defeating
      // default-deny. Simulation is out of scope; model it exactly (with request
      // recording + a negative test) when the first flow that needs it lands.
      await page.route('**contentful-storage.reserve-337.workers.dev/status/**', (r) =>
        fulfillEmpty(r, { restricted: false })
      )

      // Analytics — abort is safe, they are fire-and-forget beacons.
      await page.route('**sentry.io**', (r) => r.abort())
      await page.route('**mixpanel.com**', (r) => r.abort())
      await page.route('**segment.io**', (r) => r.abort())
      await page.route('**googletagmanager.com**', (r) => r.abort())
      await page.route('**connect.facebook.net**', (r) => r.abort())

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
      setYieldReplay(false)
      resetFrozenTime()

      if (calls.length) {
        await testInfo.attach('unmocked-calls', {
          body: calls.join('\n'),
          contentType: 'text/plain',
        })
      }
      // Every committed test is strict by default. Exploratory work must opt out
      // explicitly with test.use({ allowUnmocked: true }).
      if (!allowUnmocked && calls.length) {
        throw new Error(
          `test hit ${calls.length} unmocked call(s):\n${calls.join('\n')}`
        )
      }
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
