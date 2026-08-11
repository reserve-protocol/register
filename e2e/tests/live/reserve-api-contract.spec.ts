import { expect, test } from '@playwright/test'
import {
  LIVE_ENV_VARS,
  liveConfig,
  liveGet,
  type LiveTarget,
} from '../../helpers/live'
import { CHAINS, REGISTRY, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Live Reserve-API contract validation (@live) — request-level, no browser.
//
// Every request here is byte-for-byte the request register's own hooks build
// (the comment on each test names the consumer), issued against the target in
// E2E_LIVE_RESERVE_API. The oracle is the endpoint contract in
// helpers/live-contracts.ts plus request-correlated invariants a schema cannot
// express — e.g. "every token I asked to price came back priced", which is what
// actually breaks the deploy basket and the overview.
//
//   E2E_LIVE_RESERVE_API=production pnpm e2e:live
//
// Skips (not fails) when the reserve surface names no target: an offline
// checkout must never be able to "pass" this file by accident.

const config = liveConfig()
const target = config.reserve

// Basket tokens per chain, from the captured chain state — snapshot-derived
// identities (never hardcoded addresses), which is what the price endpoints are
// asked about in production.
function basketTokens(snapshotDir: string): string[] {
  const state = loadSnapshot<{ basketTokens: Array<{ address: string }> }>(
    `${snapshotDir}/chain-state.json`
  )
  return state.basketTokens.map((token) => token.address)
}

test.describe('@live reserve API contract', () => {
  test.skip(
    !target,
    `set ${LIVE_ENV_VARS.reserve} (e.g. production) to validate the live reserve API`
  )

  const reserve = target as LiveTarget
  const violations: string[] = []

  test.afterEach(() => {
    expect(violations, violations.join('\n')).toEqual([])
    violations.length = 0
  })

  for (const dtf of REGISTRY.filter((entry) => !entry.deprecated)) {
    // hooks/usePrices.ts + views/index-dtf/deploy/updater.tsx — the deploy
    // wizard prices its whole basket in ONE batch and renders $0 for any token
    // the response omits, so a partial answer is a product bug, not a nicety.
    test(`current prices for the ${dtf.slug} basket (${dtf.chain})`, async ({ request }) => {
      const tokens = basketTokens(dtf.snapshotDir)
      expect(tokens.length).toBeGreaterThan(0)

      const { status, data } = await liveGet(
        request,
        reserve,
        `/current/prices?tokens=${tokens.join(',')}&chainId=${dtf.chainId}`,
        violations
      )
      expect(status).toBe(200)

      const priced = new Map(
        (data as Array<{ address: string; price?: number | null }>).map((entry) => [
          entry.address.toLowerCase(),
          entry.price,
        ])
      )
      const missing = tokens.filter((token) => !priced.has(token.toLowerCase()))
      expect(missing, `unpriced basket tokens on chain ${dtf.chainId}`).toEqual([])
      for (const token of tokens) {
        expect(priced.get(token.toLowerCase()), `price for ${token}`).toBeGreaterThan(0)
      }
    })

    // hooks/useIndexPrice.ts (overview header, portfolio rows).
    test(`current dtf price for ${dtf.slug} (${dtf.chain})`, async ({ request }) => {
      const { status, data } = await liveGet(
        request,
        reserve,
        `/current/dtf?address=${dtf.address}&chainId=${dtf.chainId}`,
        violations
      )
      expect(status).toBe(200)
      expect((data as { price?: number }).price).toBeGreaterThan(0)
    })

    // views/index-dtf/overview price chart — an empty series renders a blank
    // chart, which is why the series length is asserted, not just the shape.
    test(`historical dtf series for ${dtf.slug} (${dtf.chain})`, async ({ request }) => {
      const to = Math.floor(Date.now() / 1000)
      const from = to - 7 * 24 * 60 * 60
      const { status, data } = await liveGet(
        request,
        reserve,
        `/historical/dtf?address=${dtf.address}&chainId=${dtf.chainId}&from=${from}&to=${to}&interval=1h`,
        violations
      )
      expect(status).toBe(200)
      const series = (data as { timeseries: Array<{ timestamp: number }> }).timeseries
      expect(series.length).toBeGreaterThan(0)
      const timestamps = series.map((point) => point.timestamp)
      expect(timestamps, 'timeseries must be ascending').toEqual([...timestamps].sort((a, b) => a - b))
    })

    // hooks/use-dtf-restricted.ts fail-CLOSES on an unexpected shape: drift here
    // gates issuance/governance for every user, so the live shape is contracted.
    test(`dtf compliance for ${dtf.slug} (${dtf.chain})`, async ({ request }) => {
      const { status, data } = await liveGet(
        request,
        reserve,
        `/v2/compliance/geolocation/dtf/${dtf.address}?chainId=${dtf.chainId}`,
        violations
      )
      expect(status).toBe(200)
      expect(typeof (data as { restricted: unknown }).restricted).toBe('boolean')
    })
  }

  // hooks/use-asset-prices-with-snapshot.ts / useSimulatedBasket.ts.
  test('historical asset prices', async ({ request }) => {
    const dtf = REGISTRY.find((entry) => entry.chain === 'base' && !entry.deprecated)!
    const [token] = basketTokens(dtf.snapshotDir)
    const to = Math.floor(Date.now() / 1000)
    const { status, data } = await liveGet(
      request,
      reserve,
      `/historical/prices?address=${token}&chainId=${dtf.chainId}&from=${to - 86_400}&to=${to}&interval=1h`,
      violations
    )
    expect(status).toBe(200)
    expect((data as { timeseries: unknown[] }).timeseries.length).toBeGreaterThan(0)
  })

  // hooks/use-geolocation.ts (app-wide gate) and use-wallet-compliance.ts.
  test('compliance surfaces', async ({ request }) => {
    const geo = await liveGet(request, reserve, '/v2/compliance/geolocation', violations)
    expect(geo.status).toBe(200)
    expect(typeof (geo.data as { countryCode: unknown }).countryCode).toBe('string')

    const wallet = await liveGet(
      request,
      reserve,
      `/v2/compliance/wallet/${TEST_ADDRESS}`,
      violations
    )
    expect(wallet.status).toBe(200)
    expect(typeof (wallet.data as { isRestricted: unknown }).isRestricted).toBe('boolean')
  })

  // views/home discover lists — every registry chain must be discoverable, or
  // the home page silently drops a chain.
  test('discover dtfs', async ({ request }) => {
    const { status, data } = await liveGet(request, reserve, '/v1/discover/dtfs', violations)
    expect(status).toBe(200)
    const dtfs = data as Array<{ chainId: number }>
    expect(dtfs.length).toBeGreaterThan(0)
    const chains = new Set(dtfs.map((entry) => entry.chainId))
    for (const chain of Object.values(CHAINS)) {
      expect([...chains], `discover covers chain ${chain.chainId}`).toContain(chain.chainId)
    }
  })

  // views/portfolio-page — an unfunded address must still return the full shape
  // (the header maps over each list unconditionally).
  test('portfolio shape for an empty address', async ({ request }) => {
    const { status, data } = await liveGet(
      request,
      reserve,
      `/v1/portfolio/${TEST_ADDRESS}`,
      violations
    )
    expect(status).toBe(200)
    expect(Array.isArray((data as { indexDTFs: unknown }).indexDTFs)).toBe(true)
  })

  // views/index-dtf/auctions asset-volatility inputs (an object here crashes
  // tokens.map and takes the rebalance view down through its error boundary).
  test('zappable token list', async ({ request }) => {
    const { status, data } = await liveGet(
      request,
      reserve,
      `/zapper/tokens?chainId=${CHAINS.base.chainId}`,
      violations
    )
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
