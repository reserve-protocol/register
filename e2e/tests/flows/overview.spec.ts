import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Behavioral coverage for the Index DTF overview: the Holdings table (rows +
// the Exposure/Collateral market-cap framings that must never cross — see
// docs/wiki/domains/basket-overview.md), the price chart across time ranges,
// and the deprecated-DTF state. All offline; every test asserts zero unmocked
// boundary calls at the end.

const LCAP = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const DEPRECATED = '0x47686106181b3cefe4eaf94c4c10b48ac750370b' // base/deprecated (VTF, v4.0.0)

interface ExposureToken {
  address: string
  symbol: string
  weight: number
  marketCap?: number
}
interface ExposureGroup {
  native: { symbol?: string; caip2?: string; coingeckoId?: string } | null
  tokens: ExposureToken[]
  totalWeight: number
  marketCap?: number
}

// Mirror of src/utils formatMarketCap so expectations derive from the snapshot,
// not hardcoded strings.
function formatMcap(v: number): string {
  if (!v) return '—'
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${(v / 1e3).toFixed(1)}K`
}

// Mirror of buildExposureRows counting: nasdaq/nyse groups flatten to per-stock
// rows, every other group is one aggregated row; zero-weight groups drop.
const EXCHANGE_CAIP2 = new Set(['nasdaq', 'nyse'])
function expectedExposureRowCount(groups: ExposureGroup[]): number {
  return groups
    .filter((g) => g.totalWeight.toFixed(2) !== '0.00')
    .reduce(
      (n, g) =>
        n + (EXCHANGE_CAIP2.has(g.native?.caip2 ?? '') ? g.tokens.length : 1),
      0
    )
}

test('holdings table renders exposure rows and the two mcap framings never cross', async ({
  page,
  unmockedCalls,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  const groups = loadSnapshot<ExposureGroup[]>(`${dtf.snapshotDir}/exposure.json`)

  // Heaviest group (tables default-sort by weight desc) — for lcap that's the
  // BTC group holding cbBTC.
  const topGroup = [...groups].sort((a, b) => b.totalWeight - a.totalWeight)[0]
  const topToken = topGroup.tokens[0]

  // Exposure framing: crypto group rows show the NATIVE asset's market cap
  // (coingeckoId -> group.marketCap). Collateral framing: the tokenized
  // wrapper's own mcap (token.marketCap). Deliberately different numbers.
  const expectedExposureMcap = formatMcap(topGroup.marketCap ?? 0)
  const expectedCollateralMcap = formatMcap(topToken.marketCap ?? 0)
  expect(expectedExposureMcap).not.toBe(expectedCollateralMcap) // snapshot sanity

  await page.goto(dtfPath(dtf, 'overview'))

  const basket = page.getByTestId('overview-basket')
  const rows = basket.getByTestId('overview-basket-row')

  // Exposure is the default tab: one desktop row per exposure group (the
  // mobile rows are sm:hidden and carry no testid).
  await expect(rows).toHaveCount(expectedExposureRowCount(groups))

  // Top row shows the group weight from exposure.json and the native mcap.
  const topRow = rows.first()
  await expect(topRow).toContainText(`${topGroup.totalWeight.toFixed(2)}%`)
  await expect(topRow.getByTestId('overview-basket-mcap')).toHaveText(
    expectedExposureMcap
  )

  // Switch to Collateral: same top asset (weight-sorted), but the mcap now
  // reads the tokenized wrapper's cap — the framing must flip.
  await page.getByTestId('overview-basket-tab-collateral').click()
  const collateralTop = basket.getByTestId('overview-basket-row').first()
  await expect(collateralTop).toContainText(`$${topToken.symbol}`)
  await expect(collateralTop.getByTestId('overview-basket-mcap')).toHaveText(
    expectedCollateralMcap
  )

  // And back: exposure framing restored, not stuck on collateral values.
  await page.getByTestId('overview-basket-tab-exposure').click()
  await expect(
    basket.getByTestId('overview-basket-row').first().getByTestId('overview-basket-mcap')
  ).toHaveText(expectedExposureMcap)

  expect(unmockedCalls).toEqual([])
})

test('price chart renders and survives time-range switches', async ({
  page,
  unmockedCalls,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  await page.goto(dtfPath(dtf, 'overview'))

  const chart = page.getByTestId('overview-price-chart')
  // recharts mounts an SVG once the price-history query resolves — presence
  // proves the data path (no crash, no permanently-empty chart area).
  await expect(chart.locator('svg').first()).toBeVisible()
  await expect(chart.locator('.recharts-area-curve').first()).toHaveAttribute('d', /.+/)

  // Cycle the available ranges (each refetches historical/dtf with a different
  // window). The footer is duplicated for the xl/non-xl layouts, so scope to
  // the visible button. The chart must stay mounted after every switch and the
  // test must end with zero unmocked endpoints.
  for (const range of ['7d', '1m', 'ytd', '1y', 'all', '24h']) {
    const btn = page.locator(`[data-testid="overview-range-${range}"]:visible`)
    if ((await btn.count()) === 0) continue // range not offered for this DTF
    await btn.click()
    await expect(btn).toHaveAttribute('data-active', 'true')
    await expect(chart.locator('svg').first()).toBeVisible()
    await expect(chart.locator('.recharts-area-curve').first()).toHaveAttribute('d', /.+/)
  }

  const historyRequests = boundaryRequests.filter(
    (request) => request.boundary === 'api' && request.pathname === '/historical/dtf'
  )
  expect(historyRequests.length).toBeGreaterThan(1)
  const signatures = new Set(
    historyRequests.map((request) => {
      if (request.boundary !== 'api') return ''
      expect(request.search.chainId).toBe(String(dtf.chainId))
      expect(request.search.address.toLowerCase()).toBe(dtf.address.toLowerCase())
      expect(Number(request.search.from)).toBeLessThan(Number(request.search.to))
      expect(['5m', '1h', '1d']).toContain(request.search.interval)
      return `${request.search.from}:${request.search.to}:${request.search.interval}`
    })
  )
  expect(signatures.size).toBeGreaterThan(1)

  expect(unmockedCalls).toEqual([])
})

test('deprecated DTF overview renders its inactive state', async ({
  page,
  unmockedCalls,
}) => {
  const dtf = findDtfByAddress(DEPRECATED) as RegistryDTF
  interface DtfSnapshot {
    dtf: { token: { name: string } }
  }
  const { token } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf

  await page.goto(dtfPath(dtf, 'overview'))

  // The overview still renders DTF data for a deprecated (v4.0.0) DTF.
  await expect(page.getByTestId('overview-dtf-name')).toContainText(token.name)

  // Deprecated status (synchronous dtf-catalog lookup — the fixture DTF is
  // catalog-listed, nothing to mock) surfaces as the Inactive badge next to the
  // title. Label is Lingui-translated, so key on the testid, never the copy.
  await expect(page.getByTestId('overview-inactive-badge')).toBeVisible()

  expect(unmockedCalls).toEqual([])
})
