import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Governance proposal-list lifecycle: the list feeds from the proposals subgraph
// op; holding it parks the list (dtf already loaded) → list skeleton → release →
// the proposals card. A reliable subgraph-op island freeze.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('governance list: skeleton → proposals @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  const skeleton = page.getByTestId('governance-list-skeleton')

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDtfProposals' })
  await harness.goto(base, 'governance')

  await expect(skeleton.first()).toBeVisible({ timeout: 12_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)

  hold.release()
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({ timeout: 15_000 })
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
})
