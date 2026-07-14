import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Factsheet (public /performance route) renders offline — desktop + mobile.
// Previously zero-coverage + zero-testid. Uses the DTF (SDK) + price-history API.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('factsheet: renders offline @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await harness.goto(base, 'performance')
  await expect(page.getByTestId('dtf-factsheet')).toBeVisible({ timeout: 15_000 })
})
