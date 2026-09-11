import { test, expect } from '../../../e2e/harness'
import {
  REGISTRY,
  YIELD_REGISTRY,
  TEST_ADDRESS,
} from '../../../e2e/helpers/registry'

const lcap = REGISTRY.find((dtf) => dtf.slug === 'lcap')!
const eusd = YIELD_REGISTRY.find((dtf) => dtf.slug === 'eusd')!

for (const width of [375, 1400]) {
  test(`production portfolio ${width}`, async ({ harness }, info) => {
    const now = Math.floor(Date.now() / 1000)
    const position = {
      address: lcap.address,
      chainId: lcap.chainId,
      name: 'CF Large Cap Index',
      symbol: 'LCAP',
      decimals: 18,
      amount: '1523.128891',
      value: 10432.19,
      performance7d: 0.0421,
      price: 6.85,
      marketCap: 4200000,
      mintAPY: null,
      averageCost: 6.12,
      unrealizedPnL: 1112.4,
      rewards: [],
    }
    harness.mock.api(
      { pathname: `/v1/portfolio/${TEST_ADDRESS}` },
      {
        totalHoldingsUSD: 10432.19,
        indexDTFs: Array.from({ length: 6 }, (_, index) => ({
          ...position,
          name:
            index === 5 ? 'Sixth position' : `${position.name} ${index + 1}`,
          value: index === 5 ? 99999 : position.value - index,
        })),
        yieldDTFs: [],
        voteLocks: [],
        rsrBalances: [],
        stakedRSR: [
          {
            address: eusd.address,
            chainId: 1,
            stRSRAddress: '0x18ba6e33ceb80f077DEb9260c9111e62f21aE7B8',
            name: 'Electronic Dollar',
            symbol: 'eusdRSR',
            amount: '0',
            rsrAmount: '0',
            value: 0,
            performance7d: null,
            apy: null,
            votingPower: '0',
            votingWeight: 0,
            delegate: null,
            activeProposals: [],
            pendingWithdrawals: [
              {
                endId: 1,
                amount: '250',
                availableAt: now + 86400 * 13,
                delay: 1209600,
                value: 1.46,
              },
              {
                endId: 2,
                amount: '100',
                availableAt: now - 3600,
                delay: 1209600,
                value: 0.59,
              },
            ],
          },
        ],
      }
    )
    harness.mock.api(
      { pathname: `/v1/portfolio/${TEST_ADDRESS}/historical` },
      { timeseries: [] }
    )
    harness.mock.api(
      { pathname: `/v1/portfolio/${TEST_ADDRESS}/transactions` },
      []
    )
    const page = harness.page
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`/portfolio?account=${TEST_ADDRESS}`)
    const tables = page.locator('table')
    await expect(tables.first()).toBeVisible()
    await expect(tables.first().locator('tbody tr')).toHaveCount(5)
    await tables
      .first()
      .evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await page.evaluate(() => document.fonts.ready)
    await info.attach('positions', {
      body: await page.screenshot({
        path: `/private/tmp/table-production-${width}-positions.png`,
      }),
      contentType: 'image/png',
    })
    const withdrawals = tables.last()
    await withdrawals.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await info.attach('withdrawals', {
      body: await page.screenshot({
        path: `/private/tmp/table-production-${width}-withdrawals.png`,
      }),
      contentType: 'image/png',
    })
    await info.attach('table-semantics', {
      body: Buffer.from(
        JSON.stringify(
          await tables.evaluateAll((nodes) =>
            nodes.map((el) => ({
              text: el.textContent,
              width: el.getBoundingClientRect().width,
              rows: [...el.querySelectorAll('tbody tr')].map(
                (row) => row.textContent
              ),
            }))
          ),
          null,
          2
        )
      ),
      contentType: 'application/json',
    })
    expect(harness.tx.log).toHaveLength(0)
  })
}
