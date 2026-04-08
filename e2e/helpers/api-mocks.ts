import type { Page } from '@playwright/test'
import { loadSnapshot, snapshotExists } from './snapshot-loader'
import { DTF } from './test-data'

function findDTFByAddress(address: string) {
  const lower = address.toLowerCase()
  return Object.values(DTF).find((d) => d.address.toLowerCase() === lower)
}

/**
 * Mock all api.reserve.org and external API endpoints with page.route()
 *
 * Uses snapshot data for discover/metrics/per-DTF endpoints.
 * Simple mocks stay inline for endpoints that don't need real data.
 */
export async function mockApiRoutes(page: Page) {
  // Merkl campaign API — prevents real network calls from overview page
  await page.route('**/api.merkl.xyz/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/api.reserve.org/**', (route) => {
    const url = route.request().url()
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname

    // Discover DTF list — chain-independent, return full snapshot
    if (pathname.includes('/discover/dtf')) {
      const data = loadSnapshot('shared/discover-dtfs.json')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    }

    // Protocol metrics (TVL, revenue, etc)
    if (pathname.includes('/protocol/metrics')) {
      const data = loadSnapshot('shared/protocol-metrics.json')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    }

    // Folio manager / brand data — load per-DTF from snapshot
    if (pathname.includes('/folio-manager')) {
      const folio = parsedUrl.searchParams.get('folio')
      const dtf = folio ? findDTFByAddress(folio) : undefined

      if (dtf && snapshotExists(`${dtf.snapshotDir}/folio-manager.json`)) {
        const data = loadSnapshot(`${dtf.snapshotDir}/folio-manager.json`)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        })
      }

      // No snapshot for this DTF — fail loud
      console.error(`[api-mock] No folio-manager snapshot for: ${folio}`)
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: `No folio-manager snapshot for ${folio}`,
        }),
      })
    }

    // Current DTF price + basket — load per-DTF from snapshot
    if (
      pathname.includes('/current/dtf') ||
      pathname.includes('/current/dtfs')
    ) {
      const address = parsedUrl.searchParams.get('address')
      const dtf = address ? findDTFByAddress(address) : undefined

      if (dtf && snapshotExists(`${dtf.snapshotDir}/current-price.json`)) {
        const data = loadSnapshot(`${dtf.snapshotDir}/current-price.json`)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        })
      }

      // No snapshot for this DTF — fail loud
      console.error(
        `[api-mock] No current-price snapshot for: ${address}`
      )
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: `No current-price snapshot for ${address}`,
        }),
      })
    }

    // DTF exposure data — must be an array (ExposureGroup[])
    if (pathname.includes('/dtf/exposure')) {
      const address = parsedUrl.searchParams.get('address')
      const dtf = address ? findDTFByAddress(address) : undefined

      if (dtf && snapshotExists(`${dtf.snapshotDir}/exposure.json`)) {
        const data = loadSnapshot(`${dtf.snapshotDir}/exposure.json`)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        })
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }

    // DTF icons
    if (pathname.includes('/dtf/icons')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }

    // Historical DTF price data
    if (pathname.includes('/historical/dtf')) {
      const address = parsedUrl.searchParams.get('address')
      const dtf = address ? findDTFByAddress(address) : undefined

      if (dtf && snapshotExists(`${dtf.snapshotDir}/historical-price.json`)) {
        const data = loadSnapshot(`${dtf.snapshotDir}/historical-price.json`)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        })
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ timeseries: [] }),
      })
    }

    // DTF price / quote data
    if (pathname.includes('/dtf/price')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ price: 1.0 }),
      })
    }

    // Health check endpoint
    if (pathname === '/health' || pathname.endsWith('/health')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      })
    }

    // Zapper widget healthcheck + quotes
    if (pathname.includes('/zapper/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', healthy: true }),
      })
    }

    // Current token prices — match by chainId param
    if (pathname.includes('/current/prices')) {
      const chainId = parsedUrl.searchParams.get('chainId')

      if (chainId) {
        const dtf = Object.values(DTF).find(
          (d) =>
            String(d.chain.id) === chainId &&
            snapshotExists(`${d.snapshotDir}/token-prices.json`)
        )
        if (dtf) {
          const data = loadSnapshot(`${dtf.snapshotDir}/token-prices.json`)
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data),
          })
        }
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }

    // DTF DAOs / vote lock positions
    if (pathname.includes('/dtf/daos')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }

    // Catch-all — unmocked API endpoint, fail loudly
    console.error(`[api-mock] UNMOCKED endpoint: ${url}`)
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unmocked API endpoint', url }),
    })
  })
}
