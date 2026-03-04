import type { Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mocksDir = join(__dirname, '..', 'mocks')

const discoverDtfData = JSON.parse(
  readFileSync(join(mocksDir, 'discover-dtf.json'), 'utf-8')
)
const protocolMetricsData = JSON.parse(
  readFileSync(join(mocksDir, 'protocol-metrics.json'), 'utf-8')
)

/**
 * Mock all api.reserve.org endpoints with page.route()
 *
 * Uses a single route handler to avoid glob pattern issues with query strings.
 * Playwright glob `**` doesn't match `?` in URLs reliably.
 */
export async function mockApiRoutes(page: Page) {
  await page.route('**/api.reserve.org/**', (route) => {
    const url = route.request().url()
    const pathname = new URL(url).pathname

    // Discover DTF list — only return data for Base (8453), empty for other chains.
    if (pathname.includes('/discover/dtf')) {
      const chainId = new URL(url).searchParams.get('chainId')
      const data = chainId === '8453' ? discoverDtfData : []
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    }

    // Protocol metrics (TVL, revenue, etc)
    if (pathname.includes('/protocol/metrics')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(protocolMetricsData),
      })
    }

    // Folio manager / brand data
    // Code checks `response.status !== 'ok'` and throws if missing
    if (pathname.includes('/folio-manager')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          parsedData: {
            dtf: {
              icon: '',
              cover: '',
              mobileCover: '',
              description:
                'A diversified large cap index tracking the top crypto assets by market capitalization.',
              notesFromCreator: 'Rebalanced quarterly.',
              prospectus: '',
              tags: ['large-cap', 'index'],
              basketType: 'percentage-based',
            },
            creator: {
              name: 'Reserve Protocol',
              icon: '',
              link: 'https://reserve.org',
            },
            curator: { name: '', icon: '', link: '' },
            socials: {
              twitter: 'https://twitter.com/reserveprotocol',
              telegram: '',
              discord: '',
              website: 'https://reserve.org',
            },
          },
        }),
      })
    }

    // DTF exposure data — must be an array (ExposureGroup[])
    // The updater sets atom directly from response.json()
    if (pathname.includes('/dtf/exposure')) {
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

    // Current DTF price + basket (useIndexPrice.ts)
    // Must return { price, basket: [...] } or priceResult.basket.reduce() crashes
    if (pathname.includes('/current/dtf')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          price: 1.25,
          basket: [
            {
              address: '0x4200000000000000000000000000000000000006',
              amount: 0.15,
              price: 2450.5,
              weight: '20.00',
            },
            {
              address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
              amount: 0.35,
              price: 1.0,
              weight: '35.00',
            },
            {
              address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
              amount: 0.002,
              price: 62450.25,
              weight: '25.00',
            },
            {
              address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
              amount: 1.5,
              price: 12.45,
              weight: '20.00',
            },
          ],
        }),
      })
    }

    // Historical DTF price data (use-dtf-price-history.ts)
    if (pathname.includes('/historical/dtf')) {
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

    // Zapper widget healthcheck + quotes
    if (pathname.includes('/zapper/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', healthy: true }),
      })
    }

    // Current token prices
    if (pathname.includes('/current/prices')) {
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
        body: JSON.stringify([
          {
            chainId: 8453,
            token: {
              address: '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1',
              name: 'Staked LCAP',
              symbol: 'stLCAP',
              decimals: 18,
              price: 1.31,
            },
            underlying: {
              token: {
                address: '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
                name: 'Large Cap Index DTF',
                symbol: 'LCAP',
                decimals: 18,
                price: 1.25,
              },
            },
            rewards: [
              {
                token: {
                  address: '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
                  name: 'Large Cap Index DTF',
                  symbol: 'LCAP',
                  decimals: 18,
                  price: 1.25,
                },
                amount: 125.5,
                amountUsd: 156.88,
              },
            ],
            dtfs: [
              {
                address: '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
                name: 'Large Cap Index DTF',
                symbol: 'LCAP',
                decimals: 18,
                price: 1.25,
              },
            ],
            lockedAmount: 2500000,
            lockedAmountUsd: 3125000,
            totalRewardAmountUsd: 156.88,
            avgDailyRewardAmountUsd: 5.23,
            apr: 8.42,
          },
          {
            chainId: 8453,
            token: {
              address: '0xaa1111111111111111111111111111111111111111',
              name: 'Staked CLX',
              symbol: 'stCLX',
              decimals: 18,
              price: 2.15,
            },
            underlying: {
              token: {
                address: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
                name: 'Clanker Index',
                symbol: 'CLX',
                decimals: 18,
                price: 2.1,
              },
            },
            rewards: [],
            dtfs: [
              {
                address: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
                name: 'Clanker Index',
                symbol: 'CLX',
                decimals: 18,
                price: 2.1,
              },
            ],
            lockedAmount: 1200000,
            lockedAmountUsd: 2520000,
            totalRewardAmountUsd: 0,
            avgDailyRewardAmountUsd: 0,
            apr: 5.67,
          },
        ]),
      })
    }

    // Catch-all for any other reserve API calls
    console.log(`[api-mock] unhandled: ${url}`)
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })
}
