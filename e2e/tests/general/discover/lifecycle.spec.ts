import { test, expect } from '../../../harness'

// Discover table lifecycle: the index-DTF list is API-fed (/v1/discover/dtfs);
// holding that endpoint parks the table in its skeleton → release → rows.
// General routes stay at chainIdAtom's mainnet default. Desktop-only (@smoke):
// the discover placeholder is `hidden lg:block`.
test.use({ wallet: false })

test('discover: table skeleton → rows @smoke', async ({ harness }) => {
  const page = harness.page
  const skeleton = page.getByTestId('discover-table-skeleton')

  const hold = harness.mock.hold({ boundary: 'api', pathname: '/v1/discover/dtfs' })
  await page.goto('/discover')

  await expect(page.getByTestId('discover-dtf-table')).toBeVisible({ timeout: 12_000 })
  await expect(skeleton.first()).toBeVisible({ timeout: 10_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)

  hold.release()
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
  await expect(
    page.locator('[data-testid="discover-dtf-table"] a[href*="/index-dtf/"]').first()
  ).toBeVisible({ timeout: 15_000 })
})
