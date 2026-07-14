import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Auctions rebalance-list lifecycle: the list buckets rebalances from the SDK +
// subgraph; holding GetIndexDTF parks the data chain → the list shows its
// loading skeleton → release → the list (idle: empty active section).
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('auctions list: skeleton → list @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  const skeleton = page.getByTestId('auctions-list-skeleton')

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
  await harness.goto(base, 'auctions')

  await expect(skeleton.first()).toBeVisible({ timeout: 10_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)

  hold.release()
  await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible({ timeout: 15_000 })
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
})
