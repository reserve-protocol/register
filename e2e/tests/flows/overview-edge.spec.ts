import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Degenerate-data edge cases for the Index DTF overview chart + Holdings mcap.
// The price hero is SDK-derived (basket prices) and independent of the REST
// history series, so an empty/broken history must NOT blank the hero or crash
// the page — these tests pin that graceful degradation. All offline; strict
// teardown asserts zero unmocked boundary calls.

const LCAP = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap (v5)

// Both chart data sources funnel through `path.includes('/historical/dtf')` in
// the api mock: the line series (`/historical/dtf`) and the candlestick series
// (`/v2/historical/dtf/candles/`, served line-shaped). Overriding BOTH is the
// only way to force a truly empty chart — the candlestick is the default type
// and would otherwise fall back to its own (populated) data.
const LINE_PATH = '/historical/dtf'
const CANDLE_PATH = '/v2/historical/dtf/candles/'

interface HistoryPoint {
  timestamp: number
  price: number
  totalSupply: number
  marketCap: number
  basket: unknown[]
}
interface History {
  address: string
  timeseries: HistoryPoint[]
}

interface ExposureGroup {
  native: { symbol?: string; caip2?: string; coingeckoId?: string } | null
  tokens: { address: string; symbol: string; weight: number; marketCap?: number }[]
  totalWeight: number
  marketCap?: number
}

test('chart degrades gracefully when the price history is empty', async ({
  page,
  unmockedCalls,
  overrides,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  const empty: History = { address: dtf.address.toLowerCase(), timeseries: [] }
  overrides.api({ pathname: LINE_PATH }, empty)
  overrides.api({ pathname: CANDLE_PATH }, empty)

  await page.goto(dtfPath(dtf, 'overview'))

  // Chart container mounts and the SDK-derived hero (name/symbol/price) renders
  // regardless of the REST history — an empty series must not blank the hero or
  // throw into an error boundary that takes the page down.
  await expect(page.getByTestId('overview-price-chart')).toBeVisible()
  await expect(page.getByTestId('overview-dtf-name')).toBeVisible()
  await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(/^\$\w+/)
  // The rest of the page (Holdings) still hydrates — proves no cascade crash.
  await expect(page.getByTestId('overview-basket')).toBeVisible()

  // Give the chart queries a chance to resolve to their empty payload and
  // re-render, then confirm the page is still intact (no delayed throw).
  await expect
    .poll(
      () =>
        page.evaluate(
          () => !!document.querySelector('[data-testid="overview-price-chart"]')
        ),
      { timeout: 5_000 }
    )
    .toBe(true)
  await expect(page.getByTestId('overview-dtf-name')).toBeVisible()

  expect(unmockedCalls).toEqual([])
})

test('chart survives a single-point price history', async ({
  page,
  unmockedCalls,
  overrides,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  const full = loadSnapshot<History>(`${dtf.snapshotDir}/historical-price.json`)
  const single: History = {
    address: full.address,
    timeseries: [full.timeseries[0]],
  }
  overrides.api({ pathname: LINE_PATH }, single)
  overrides.api({ pathname: CANDLE_PATH }, single)

  await page.goto(dtfPath(dtf, 'overview'))

  // A single data point is the classic off-by-one that breaks path/domain math
  // (an area needs >=2 points). The chart must not crash; the hero + basket
  // stay rendered.
  await expect(page.getByTestId('overview-price-chart')).toBeVisible()
  await expect(page.getByTestId('overview-dtf-name')).toBeVisible()
  await expect(page.getByTestId('overview-basket')).toBeVisible()

  expect(unmockedCalls).toEqual([])
})

test('holdings mcap renders — when market-cap data is absent', async ({
  page,
  unmockedCalls,
  overrides,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  const groups = loadSnapshot<ExposureGroup[]>(`${dtf.snapshotDir}/exposure.json`)

  // Zero every mcap on both framings: the exposure map reads
  // `group.marketCap || 0` (by coingeckoId) and `token.marketCap || 0` (by
  // address). Absent/zero mcap must render the em-dash placeholder — there is
  // deliberately NO fallback between the two framings (basket-overview wiki).
  const zeroed = groups.map((g) => ({
    ...g,
    marketCap: 0,
    tokens: g.tokens.map((t) => ({ ...t, marketCap: 0 })),
  }))
  overrides.api({ pathname: '/dtf/exposure' }, zeroed)

  await page.goto(dtfPath(dtf, 'overview'))

  const basket = page.getByTestId('overview-basket')
  const firstMcap = () =>
    basket.getByTestId('overview-basket-row').first().getByTestId('overview-basket-mcap')

  // Exposure tab (default): top row mcap is the em-dash placeholder.
  await expect(firstMcap()).toHaveText('—')

  // Collateral tab: still —, the framing does not borrow the other tab's value.
  await page.getByTestId('overview-basket-tab-collateral').click()
  await expect(firstMcap()).toHaveText('—')

  expect(unmockedCalls).toEqual([])
})
