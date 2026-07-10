import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Home + discover behavioral flows, fully offline. No wallet and no frozen clock:
// none of these surfaces are time- or connection-dependent, so real timers let
// react-query flush naturally (the clock-pump protocol only applies to frozen
// write flows). Content is derived from the same snapshot the API mock serves.

interface DiscoverDTF {
  address: string
  symbol: string
  name: string
  type?: string
  status?: string
  marketCap?: number
}

// Active index DTFs, market-cap desc — the same order the app renders, so the
// top entries are guaranteed on page 1 of the paginated table.
function topIndexDtfs(): DiscoverDTF[] {
  return loadSnapshot<DiscoverDTF[]>('shared/discover-dtfs.json')
    .filter((d) => d.type === 'index' && d.status === 'active')
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
}

const LCAP_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap (registry)

test('search narrows the table to the matching DTF and clearing restores it', async ({
  page,
}) => {
  const [primary, secondary] = topIndexDtfs()

  await page.goto('/discover')

  const table = page.getByTestId('discover-dtf-table')
  const rows = table.locator('table tbody tr')

  // Baseline: both top DTFs are on page 1.
  await expect(rows.filter({ hasText: primary.symbol })).toHaveCount(1)
  await expect(rows.filter({ hasText: secondary.symbol })).toHaveCount(1)

  // Search by the primary symbol — the table narrows to just that DTF.
  await page.getByTestId('discover-search').fill(primary.symbol)
  await expect(rows.filter({ hasText: primary.symbol })).toHaveCount(1)
  await expect(rows.filter({ hasText: secondary.symbol })).toHaveCount(0)

  // Clearing restores the full set — the other DTF reappears.
  await page.getByTestId('discover-search').fill('')
  await expect(rows.filter({ hasText: secondary.symbol })).toHaveCount(1)
})

test('switching discover tabs changes the visible set without errors', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  const [primary] = topIndexDtfs()

  await page.goto('/discover')

  const table = page.getByTestId('discover-dtf-table')

  // Index tab (default): the index-DTF table is present with the top DTF.
  await expect(table.locator('table')).toHaveCount(1)
  await expect(table).toContainText(primary.symbol)

  // Switch to yield — the index table unmounts entirely (yield renders cards).
  await page.getByTestId('discover-tab-yield').click()
  await expect(table.locator('table')).toHaveCount(0)

  // Switch back to index — the table returns.
  await page.getByTestId('discover-tab-index').click()
  await expect(table.locator('table')).toHaveCount(1)
  await expect(table).toContainText(primary.symbol)

  expect(pageErrors).toEqual([])
})

test('clicking a DTF row navigates to its overview page', async ({ page }) => {
  const dtf = findDtfByAddress(LCAP_ADDRESS)!
  const lcap = topIndexDtfs().find(
    (d) => d.address.toLowerCase() === LCAP_ADDRESS.toLowerCase()
  )!

  await page.goto('/discover')

  const table = page.getByTestId('discover-dtf-table')
  const row = table.locator('table tbody tr').filter({ hasText: lcap.symbol })
  await expect(row).toHaveCount(1)

  // The name cell is the row's only link; it routes to the DTF overview.
  await row.getByRole('link').click()

  // getFolioRoute lowercases the address, so match case-insensitively.
  const expected = dtfPath(dtf, 'overview').toLowerCase()
  await expect(page).toHaveURL(new RegExp(expected, 'i'))
})

test('home hero and featured section render without unmocked calls', async ({
  page,
  unmockedCalls,
}) => {
  // Featured DTFs are fetched from the staging host, which the base fixture does
  // NOT intercept — serve them here from the discover snapshot so the highlighted
  // section renders offline. Register before navigation so the first fetch hits it.
  const featured = topIndexDtfs().slice(0, 3)
  await page.route('**api-staging.reserve.org/**', (route) =>
    route.fulfill({
      json: {
        order: featured.map((d) => d.symbol),
        items: Object.fromEntries(featured.map((d) => [d.symbol, [d]])),
      },
    })
  )

  await page.goto('/')

  // Hero shell renders.
  await expect(page.getByTestId('home-hero')).toBeVisible()

  // Featured/highlighted section rendered its cards (each card is a link).
  const highlighted = page.getByTestId('home-highlighted')
  await expect(highlighted).toBeAttached()
  expect(await highlighted.locator('a').count()).toBeGreaterThan(0)

  // Every boundary was answered — no live calls leaked.
  expect(unmockedCalls).toEqual([])
})
