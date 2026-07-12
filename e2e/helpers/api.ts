import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import type { BoundaryRequest } from './requests'
import { findDtfByAddress, REGISTRY, YIELD_REGISTRY } from './registry'
import { loadSnapshot, snapshotExists } from './snapshots'

// api.reserve.org interception, dispatched by pathname. Per-DTF endpoints load
// from snapshots keyed by the address/folio param. Unmocked endpoints fail loud
// (500 + logged) so coverage gaps surface instead of silently returning junk.

export interface GeolocationStatus {
  country: string
  countryCode: string
  restricted: boolean
  isVPN: boolean
}

export const DEFAULT_GEOLOCATION: GeolocationStatus = {
  country: 'United States',
  countryCode: 'US',
  restricted: false,
  isVPN: false,
}

export interface ApiMockOptions {
  log: UnmockedLogger
  geolocation: GeolocationStatus
  overrides?: MockOverrides
  requests?: BoundaryRequest[]
}

function json(route: import('@playwright/test').Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  })
}

function dtfFromParam(url: URL, param: string) {
  const value = url.searchParams.get(param)
  // Resolve by address alone — this mirrors the real reserve-api, whose DTF
  // endpoints key on the globally-unique folio address and treat `chainId` as
  // an advisory/default (the app sends e.g. /current/dtf?address=<base DTF>&
  // chainId=1). Enforcing chainId here would fail legitimate requests. Chain
  // identity IS enforced where the app is genuinely chain-routed: RPC host and
  // subgraph URL (see rpc.ts / subgraph.ts).
  return value ? findDtfByAddress(value) : undefined
}

function isCapturedDiscoverDtf(url: URL, addressParam = 'address'): boolean {
  const address = url.searchParams.get(addressParam)?.toLowerCase()
  const chainId = Number(url.searchParams.get('chainId'))
  if (!address || !Number.isFinite(chainId)) return false
  const discover = loadSnapshot<Array<{ address: string; chainId: number }>>(
    'shared/discover-dtfs.json'
  )
  return discover.some(
    (dtf) => dtf.address.toLowerCase() === address && Number(dtf.chainId) === chainId
  )
}

function knownPriceResponse(chainId: number, requestedTokens: Set<string>) {
  const known = new Set<string>(['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'])
  const prices: Array<{ address: string; price: number; timestamp?: number }> = []

  for (const dtf of REGISTRY.filter((entry) => entry.chainId === chainId)) {
    if (snapshotExists(`${dtf.snapshotDir}/token-prices.json`)) {
      for (const price of loadSnapshot<Array<{ address: string; price: number; timestamp?: number }>>(
        `${dtf.snapshotDir}/token-prices.json`
      )) {
        known.add(price.address.toLowerCase())
        prices.push(price)
      }
    }
    if (snapshotExists(`${dtf.snapshotDir}/chain-state.json`)) {
      const state = loadSnapshot<{ basketTokens: Array<{ address: string }> }>(
        `${dtf.snapshotDir}/chain-state.json`
      )
      for (const token of state.basketTokens) known.add(token.address.toLowerCase())
    }
    const snapshot = loadSnapshot<{
      dtf: {
        token?: { address?: string }
        stToken?: {
          token?: { address?: string }
          underlying?: { address?: string }
          rewards?: Array<{ rewardToken?: { address?: string } }>
        }
      }
    }>(`${dtf.snapshotDir}/dtf.json`).dtf
    for (const address of [
      snapshot.token?.address,
      snapshot.stToken?.token?.address,
      snapshot.stToken?.underlying?.address,
      ...(snapshot.stToken?.rewards?.map((reward) => reward.rewardToken?.address) ?? []),
    ]) {
      if (address) known.add(address.toLowerCase())
    }
  }

  // Yield RTokens price their basket/RSR/stToken via the same shared batch.
  // Their identities live in the captured eth_call map (address:calldata keys),
  // so admit every contract address that appears there for this chain — the
  // truthful set of tokens a yield view can request, without a wildcard.
  for (const dtf of YIELD_REGISTRY.filter((entry) => entry.chainId === chainId)) {
    const path = `${dtf.snapshotDir}/rtoken-chain-state.json`
    if (!snapshotExists(path)) continue
    const callMap = loadSnapshot<Record<string, string>>(path)
    for (const callKey of Object.keys(callMap)) {
      known.add(callKey.split(':')[0].toLowerCase())
    }
  }

  // The discover response can contain DTFs outside the small deterministic
  // registry used for deep journeys. Their captured basket identities are still
  // valid inputs to the shared current-price batch requested by the home/detail
  // surfaces, so admit those exact addresses without opening a wildcard.
  const discover = loadSnapshot<
    Array<{ chainId: number; basket?: Array<{ address: string }> }>
  >('shared/discover-dtfs.json')
  for (const dtf of discover) {
    if (Number(dtf.chainId) !== chainId) continue
    for (const token of dtf.basket ?? []) known.add(token.address.toLowerCase())
  }

  const commonByChain: Record<number, string[]> = {
    1: ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
    56: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0x55d398326f99059ff775485246999027b3197955',
    ],
    8453: [
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0x4200000000000000000000000000000000000006',
      '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    ],
  }
  for (const address of commonByChain[chainId] ?? []) known.add(address)
  if (![...requestedTokens].every((address) => known.has(address))) return undefined

  const byAddress = new Map(prices.map((price) => [price.address.toLowerCase(), price]))
  return [...requestedTokens].map(
    (address) =>
      byAddress.get(address) ?? {
        address,
        price: 1,
        timestamp: Math.floor(Date.now() / 1000),
      }
  )
}

export async function mockApiRoutes(page: Page, options: ApiMockOptions) {
  const { log, geolocation, overrides, requests } = options

  const handler = (route: Parameters<Parameters<Page['route']>[1]>[0]) => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    const path = url.pathname // e.g. /discover/dtfs, /v2/compliance/geolocation

    requests?.push({
      boundary: 'api',
      method,
      pathname: path,
      search: Object.fromEntries(url.searchParams),
    })

    // Per-test overlay wins over snapshots — exact method/path plus any
    // identity-bearing query fields the spec supplies.
    const overlaid = overrides?.lookupApi(method, url)
    if (overlaid !== undefined) return json(route, overlaid)

    if (method !== 'GET' && !(method === 'POST' && path === '/rebalance/liquidity')) {
      log('unmocked reserve-api method', { method, path })
      return json(route, { error: 'unexpected reserve-api method' }, 405)
    }

    // Per-DTF compliance — MUST match before the generic geolocation branch
    // (same path prefix). useDTFRestricted fail-closes to restricted on a bad
    // shape, which would spuriously gate every DTF surface. Override per-test
    // via overrides.api('/v2/compliance/geolocation/dtf/', ...) for restricted
    // variants (restriction: 'geolocation-restricted' | 'geolocation-prohibited' | 'vpn').
    if (path.includes('/v2/compliance/geolocation/dtf/')) {
      return json(route, {
        country: geolocation.country,
        countryCode: geolocation.countryCode,
        restricted: false,
        restriction: 'none',
      })
    }

    // Compliance geolocation — unrestricted US by default; fixture-overridable.
    if (path.includes('/v2/compliance/geolocation')) {
      return json(route, geolocation)
    }

    // Per-wallet compliance — unrestricted. `address` is the last path segment.
    if (path.includes('/v2/compliance/wallet/')) {
      const address = path.split('/').pop() ?? ''
      return json(route, { address, isRestricted: false, shouldSkipRestrictions: false })
    }

    // Connected-wallet portfolio (header + contact criteria) — empty holdings.
    if (path.includes('/v1/portfolio/')) {
      return json(route, {
        totalHoldingsUSD: 0,
        indexDTFs: [],
        yieldDTFs: [],
        stakedRSR: [],
        voteLocks: [],
        rsrBalances: [],
      })
    }

    // Featured DTFs — src deliberately hits the STAGING host for this
    // (use-featured-dtfs.ts TODO), which is why the staging host is routed too.
    if (path.includes('/discover/featured')) {
      return json(route, loadSnapshot('shared/featured-dtfs.json'))
    }

    if (path.includes('/discover/dtf')) {
      return json(route, loadSnapshot('shared/discover-dtfs.json'))
    }

    if (path.includes('/protocol/metrics')) {
      return json(route, loadSnapshot('shared/protocol-metrics.json'))
    }

    if (path.includes('/folio-manager')) {
      const dtf = dtfFromParam(url, 'folio')
      if (dtf && snapshotExists(`${dtf.snapshotDir}/folio-manager.json`)) {
        return json(route, loadSnapshot(`${dtf.snapshotDir}/folio-manager.json`))
      }
      log('unmocked reserve-api identity', {
        path,
        folio: url.searchParams.get('folio'),
        chainId: url.searchParams.get('chainId'),
      })
      return json(route, { error: 'unknown folio-manager identity' }, 500)
    }

    if (path.includes('/current/dtf')) {
      const dtf = dtfFromParam(url, 'address')
      if (!dtf && isCapturedDiscoverDtf(url)) return json(route, {})
      if (!dtf) {
        log('unmocked reserve-api identity', {
          path,
          address: url.searchParams.get('address'),
          chainId: url.searchParams.get('chainId'),
        })
        return json(route, { error: 'unknown current-dtf identity' }, 500)
      }
      if (snapshotExists(`${dtf.snapshotDir}/current-price.json`)) {
        return json(route, loadSnapshot(`${dtf.snapshotDir}/current-price.json`))
      }
      log('unmocked reserve-api', { path, param: url.searchParams.get('address') })
      return json(route, { error: 'no current-price snapshot', path }, 500)
    }

    if (path.includes('/dtf/exposure')) {
      const dtf = dtfFromParam(url, 'address')
      if (dtf && snapshotExists(`${dtf.snapshotDir}/exposure.json`)) {
        return json(route, loadSnapshot(`${dtf.snapshotDir}/exposure.json`))
      }
      if (isCapturedDiscoverDtf(url)) return json(route, [])
      log('unmocked reserve-api identity', {
        path,
        address: url.searchParams.get('address'),
        chainId: url.searchParams.get('chainId'),
      })
      return json(route, { error: 'unknown exposure identity' }, 500)
    }

    if (path.includes('/dtf/icons')) {
      return json(route, {})
    }

    // Ondo tokenized-equity limits — polled by the overview once basket data
    // resolves. No registry DTF holds Ondo assets, so the empty shape is the
    // truthful state (and keeps market-paused warnings deterministic).
    if (path.includes('/dtf/ondo')) {
      if (!isCapturedDiscoverDtf(url)) {
        log('unmocked reserve-api identity', {
          path,
          address: url.searchParams.get('address'),
          chainId: url.searchParams.get('chainId'),
        })
        return json(route, { error: 'unknown dtf-ondo identity' }, 500)
      }
      return json(route, { market: null, assets: [] })
    }

    // Per-asset historical prices (simulated basket / snapshot pricing) — the
    // consumer keys results by the echoed address and treats an empty
    // timeseries as price 0. Overlay per-test for real magnitudes.
    if (path.includes('/historical/prices')) {
      const address = url.searchParams.get('address')?.toLowerCase()
      const chainId = Number(url.searchParams.get('chainId'))
      if (address && knownPriceResponse(chainId, new Set([address]))) {
        return json(route, { address, timeseries: [] })
      }
      log('unmocked reserve-api identity', {
        path,
        address: address ?? '(missing)',
        chainId: url.searchParams.get('chainId'),
      })
      return json(route, { error: 'unknown historical-price identity' }, 500)
    }

    if (path.includes('/historical/dtf')) {
      const dtf = dtfFromParam(url, 'address')
      if (dtf && snapshotExists(`${dtf.snapshotDir}/historical-price.json`)) {
        return json(route, loadSnapshot(`${dtf.snapshotDir}/historical-price.json`))
      }
      log('unmocked reserve-api identity', {
        path,
        address: url.searchParams.get('address'),
        chainId: url.searchParams.get('chainId'),
      })
      return json(route, { error: 'unknown historical-dtf identity' }, 500)
    }

    if (path.includes('/dtf/price')) {
      return json(route, { price: 1.0 })
    }

    if (path.includes('/current/prices')) {
      const chainId = url.searchParams.get('chainId')
      const requestedTokens = new Set(
        (url.searchParams.get('tokens') ?? '')
          .split(',')
          .filter(Boolean)
          .map((token) => token.toLowerCase())
      )
      const response = knownPriceResponse(Number(chainId), requestedTokens)
      if (response && requestedTokens.size > 0) return json(route, response)
      log('unmocked reserve-api identity', {
        path,
        chainId,
        tokens: [...requestedTokens].sort(),
      })
      return json(route, { error: 'unknown token-price identity' }, 500)
    }

    if (path.includes('/dtf/daos')) {
      return json(route, [])
    }

    // Token LIST endpoint — must match before the generic /zapper healthcheck:
    // an object here crashes use-asset-price-volatility's tokens.map and takes
    // the whole rebalance detail down via its error boundary.
    if (path.includes('/zapper/tokens')) {
      return json(route, [])
    }

    if (path.includes('/zapper')) {
      return json(route, { status: 'ok', healthy: true })
    }

    // Rebalance liquidity probe (POST) — deterministic empty; auction specs
    // overlay real payloads per-test.
    if (path.includes('/rebalance/liquidity')) {
      return json(route, { market: null, totals: { sellUsd: 0, buyUsd: 0 }, assets: [] })
    }

    if (path.endsWith('/health')) {
      return json(route, { status: 'ok' })
    }

    // Yield APY updater polls this for index DTFs — empty keeps it quiet.
    if (path.includes('/dtf/apy')) {
      return json(route, {})
    }

    // Rebalance metrics (historical MetricsRow) — empty by default; auctions
    // specs overlay real payloads per-test via overrides.api.
    if (path.includes('/dtf/rebalance')) {
      if (!isCapturedDiscoverDtf(url)) {
        log('unmocked reserve-api identity', {
          path,
          address: url.searchParams.get('address'),
          chainId: url.searchParams.get('chainId'),
        })
        return json(route, { error: 'unknown rebalance identity' }, 500)
      }
      return json(route, [])
    }

    log('unmocked reserve-api', {
      path,
      hint: 'model in e2e/helpers/api.ts (add a path branch, or overrides.api)',
    })
    return json(route, { error: 'unmocked reserve-api endpoint', path }, 500)
  }

  await page.route('**/api.reserve.org/**', handler)
  // The glob above can't match the staging host (no `api.reserve.org` substring)
  // and src deliberately hits staging for featured DTFs — route it explicitly.
  await page.route('**/api-staging.reserve.org/**', handler)
}
