import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Settings roles island lifecycle: the roster renders from the SDK dtf data;
// holding GetIndexDTF parks it → the roles skeleton shows → release → roster.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('settings roles: skeleton → roster @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  const skeleton = page.getByTestId('settings-roles-skeleton')

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
  await harness.goto(base, 'settings')

  await expect(skeleton.first()).toBeVisible({ timeout: 10_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)

  hold.release()
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
  await expect(page.locator('#roles')).toBeVisible()
})
