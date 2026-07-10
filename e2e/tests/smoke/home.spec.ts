import { expect, test } from '../../fixtures/base'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the discover surface renders fully offline. The base fixture fails this
// test at teardown on ANY unmocked call, so a green run proves the index-DTF
// discover table loads without touching a live boundary. Content is asserted
// against the same snapshot the API mock serves — no hardcoded copy.

interface DiscoverDTF {
  symbol: string
  name: string
  type?: string
  status?: string
  marketCap?: number
}

// The top index DTF by market cap is guaranteed to land on the first page of the
// paginated table (page size 20), so its symbol/name must be visible.
function topIndexDtf(): DiscoverDTF {
  const all = loadSnapshot<DiscoverDTF[]>('shared/discover-dtfs.json')
  const index = all
    .filter((d) => d.type === 'index' && d.status === 'active')
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
  if (!index.length) throw new Error('no active index DTF in discover snapshot')
  return index[0]
}

test('discover surface renders the index-DTF table offline @smoke', async ({
  page,
}) => {
  await page.goto('/discover')

  // Tabs + table containers mounted.
  await expect(page.getByTestId('discover-tabs')).toBeVisible()
  const table = page.getByTestId('discover-dtf-table')
  await expect(table).toBeVisible()

  // The table has real rows (paginated to 20 on page 1).
  const rows = table.locator('table tbody tr')
  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeGreaterThan(0)

  // A known DTF from the snapshot appears — symbol and name, format-tolerant.
  const dtf = topIndexDtf()
  await expect(table).toContainText(dtf.symbol)
  await expect(table).toContainText(dtf.name)
})
