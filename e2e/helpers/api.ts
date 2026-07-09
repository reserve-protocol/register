import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { findDtfByAddress, REGISTRY } from './registry'
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
  return value ? findDtfByAddress(value) : undefined
}

export async function mockApiRoutes(page: Page, options: ApiMockOptions) {
  const { log, geolocation, overrides } = options

  await page.route('**/api.reserve.org/**', (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname // e.g. /discover/dtfs, /v2/compliance/geolocation

    // Per-test overlay wins over snapshots — matched by pathname substring.
    const overlaid = overrides?.lookupApi(path)
    if (overlaid !== undefined) return json(route, overlaid)

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
      return json(route, {})
    }

    if (path.includes('/current/dtf')) {
      const dtf = dtfFromParam(url, 'address')
      // Non-registry DTF (e.g. one referenced only by the discover list) — benign
      // empty, not a gap. Registry DTFs must have a snapshot, so a miss is loud.
      if (!dtf) return json(route, {})
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
      return json(route, [])
    }

    if (path.includes('/dtf/icons')) {
      return json(route, {})
    }

    if (path.includes('/historical/dtf')) {
      const dtf = dtfFromParam(url, 'address')
      if (dtf && snapshotExists(`${dtf.snapshotDir}/historical-price.json`)) {
        return json(route, loadSnapshot(`${dtf.snapshotDir}/historical-price.json`))
      }
      return json(route, { timeseries: [] })
    }

    if (path.includes('/dtf/price')) {
      return json(route, { price: 1.0 })
    }

    if (path.includes('/current/prices')) {
      const chainId = url.searchParams.get('chainId')
      const dtf = REGISTRY.find(
        (d) => String(d.chainId) === chainId && snapshotExists(`${d.snapshotDir}/token-prices.json`)
      )
      if (dtf) return json(route, loadSnapshot(`${dtf.snapshotDir}/token-prices.json`))
      return json(route, {})
    }

    if (path.includes('/dtf/daos')) {
      return json(route, [])
    }

    if (path.includes('/zapper')) {
      return json(route, { status: 'ok', healthy: true })
    }

    if (path.endsWith('/health')) {
      return json(route, { status: 'ok' })
    }

    // Yield APY updater polls this for index DTFs — empty keeps it quiet.
    if (path.includes('/dtf/apy')) {
      return json(route, {})
    }

    log('unmocked reserve-api', { path })
    return json(route, { error: 'unmocked reserve-api endpoint', path }, 500)
  })
}
