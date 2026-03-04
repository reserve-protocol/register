import { test, expect, Page } from '@playwright/test'
import { mockSubgraphRoutes } from '../helpers/subgraph-mocks'
import { mockRpcRoutes } from '../helpers/rpc-mocks'
import { mockApiRoutes } from '../helpers/api-mocks'
import { TEST_DTFS } from '../helpers/test-data'

/**
 * Setup mocks without the auto-fixture so we can customize per-test.
 */
async function setupBaseMocks(page: Page) {
  await mockRpcRoutes(page)
  await page.route('**/api.merkl.xyz/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  )
  await page.route('**/sentry.io/**', (route) => route.abort())
  await page.route('**/token-icons.llamao.fi/**', (route) => route.abort())
  await page.route('**/storage.reserve.org/**', (route) => route.abort())
  await page.route('**/yields.llama.fi/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: [] }),
    })
  )
  await page.route('**/yields.reserve.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: [] }),
    })
  )
  await page.addInitScript(() => {
    localStorage.setItem('splashVisible', 'false')
  })
}

test.describe('Edge case: Empty discover list', () => {
  test('non-Base chain returns empty DTF list', async ({ page }) => {
    await setupBaseMocks(page)
    await mockSubgraphRoutes(page)

    // Custom API mock that returns empty for ALL chains
    await page.route('**/api.reserve.org/**', (route) => {
      const url = route.request().url()
      const pathname = new URL(url).pathname

      if (pathname.includes('/discover/dtf')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
      if (pathname.includes('/protocol/metrics')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tvl: 0, revenue: 0 }),
        })
      }
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Table should render but with no data rows
    // The DataTable renders an empty tbody
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(0)
  })
})

test.describe('Edge case: Discover search', () => {
  test('search with no matches hides all DTFs', async ({ page }) => {
    await setupBaseMocks(page)
    await mockApiRoutes(page)
    await mockSubgraphRoutes(page)

    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Verify DTFs are visible first
    await expect(page.getByText('LCAP').first()).toBeVisible()

    // Type a nonsense search term
    await page.getByTestId('discover-search').fill('xyznonexistent99999')
    await page.waitForTimeout(500)

    // No DTFs from mock data should be visible
    await expect(page.getByText('LCAP')).not.toBeVisible()
    await expect(page.getByText('CLX')).not.toBeVisible()
  })

  test('search is case-insensitive', async ({ page }) => {
    await setupBaseMocks(page)
    await mockApiRoutes(page)
    await mockSubgraphRoutes(page)

    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Search for "lcap" lowercase — should find "LCAP"
    await page.getByTestId('discover-search').fill('lcap')

    await page.waitForTimeout(500)

    // Should still find results
    await expect(page.getByText('LCAP').first()).toBeVisible()
  })
})

test.describe('Edge case: Governance with no proposals', () => {
  test('shows "No proposals found" message', async ({ page }) => {
    await setupBaseMocks(page)
    await mockApiRoutes(page)

    // Custom subgraph mock that returns empty proposals
    await page.route('**/api.goldsky.com/**', (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        const body = request.postData() || ''
        const url = request.url()
        const isIndexDtf = url.includes('dtf-index')

        if (isIndexDtf) {
          if (body.includes('getDTF') || body.includes('dtf(id:')) {
            // Return DTF with stToken so governance page renders
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                data: {
                  dtf: {
                    id: TEST_DTFS.lcap.address,
                    proxyAdmin: '0x2dc04aeae96e2f2b642b066e981e80fe57abb5b2',
                    timestamp: 1704067200,
                    deployer:
                      '0x8e0507c16435caca6cb71a7fb0e0636fd3891df4',
                    ownerAddress:
                      '0x03d03a026e71979be3b08d44b01eae4c5ff9da99',
                    mintingFee: '100000000000000000',
                    tvlFee: '50000000000000000',
                    annualizedTvlFee: '5000000000000000000',
                    mandate: 'Large cap diversified index',
                    auctionDelay: '0',
                    auctionLength: '259200',
                    auctionApprovers: [],
                    auctionLaunchers: [],
                    brandManagers: [],
                    totalRevenue: 0,
                    protocolRevenue: 0,
                    governanceRevenue: 0,
                    externalRevenue: 0,
                    feeRecipients: '',
                    ownerGovernance: {
                      id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d',
                      votingDelay: 1,
                      votingPeriod: 50400,
                      proposalThreshold: 1000000000000000000,
                      quorumNumerator: 4,
                      quorumDenominator: 100,
                      timelock: {
                        id: '0x4a3f2e1d0c9b8a7f6e5d4c3b2a19f8e7d6c5b4a3',
                        guardians: [],
                        executionDelay: 172800,
                      },
                    },
                    legacyAdmins: [],
                    tradingGovernance: null,
                    legacyAuctionApprovers: [],
                    token: {
                      id: TEST_DTFS.lcap.address,
                      name: 'Large Cap Index DTF',
                      symbol: 'LCAP',
                      decimals: 18,
                      totalSupply: '5000000000000000000000000',
                      currentHolderCount: 2847,
                    },
                    stToken: {
                      id: '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1',
                      token: {
                        name: 'Staked LCAP',
                        symbol: 'stLCAP',
                        decimals: 18,
                        totalSupply: '2500000000000000000000000',
                      },
                      underlying: {
                        name: 'Large Cap Index DTF',
                        symbol: 'LCAP',
                        address: TEST_DTFS.lcap.address,
                        decimals: 18,
                      },
                      governance: {
                        id: '0x8f7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2',
                        votingDelay: 1,
                        votingPeriod: 50400,
                        proposalThreshold: 1000000000000000000,
                        quorumNumerator: 4,
                        quorumDenominator: 100,
                        timelock: {
                          id: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
                          guardians: [],
                          executionDelay: 172800,
                        },
                      },
                      legacyGovernance: [],
                      rewards: [],
                    },
                  },
                },
              }),
            })
          }

          // Return empty proposals for governance
          if (
            body.includes('getGovernanceStats') ||
            body.includes('governances(')
          ) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                data: {
                  governances: [
                    {
                      id: '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d',
                      proposals: [],
                      proposalCount: 0,
                    },
                  ],
                  stakingToken: {
                    id: '0x7e6d5c4b3a2f1e0d9c8b7a69f8e7d6c5b4a3f2e1',
                    totalDelegates: 0,
                    token: {
                      decimals: 18,
                      totalSupply: '0',
                    },
                    delegates: [],
                  },
                },
              }),
            })
          }
        }

        // Default empty response
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              tokens: [],
              transferEvents: [],
              rebalances: [],
              governances: [],
            },
          }),
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        })
      }
    })

    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/governance`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    const proposals = page.getByTestId('governance-proposals')
    await expect(proposals).toBeVisible({ timeout: 10000 })

    // Empty state message
    await expect(
      proposals.getByText('No proposals found')
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Edge case: API failure graceful degradation', () => {
  test('overview page survives API returning 500', async ({ page }) => {
    await setupBaseMocks(page)
    await mockSubgraphRoutes(page)

    // Mock API to return 500 for everything
    await page.route('**/api.reserve.org/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )

    // Page should not show an uncaught error boundary
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    // Nav should still work — subgraph data loaded
    const nav = page.getByTestId('dtf-nav')
    await expect(nav).toBeVisible()

    // DTF name from subgraph should still render
    await expect(
      page.getByText('Large Cap Index DTF').first()
    ).toBeVisible()
  })

  // NOTE: discover page CRASHES when protocol/metrics returns 500
  // ("Cannot read properties of undefined (reading 'slice')")
  // This is a real bug found by E2E testing — tracked separately.
})

test.describe('Edge case: Browser navigation', () => {
  test('back/forward navigation preserves page state', async ({ page }) => {
    await setupBaseMocks(page)
    await mockApiRoutes(page)
    await mockSubgraphRoutes(page)

    // Start at discover
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Navigate to DTF overview
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    // Go back to discover
    await page.goBack()
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Go forward to DTF overview
    await page.goForward()
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })
})
