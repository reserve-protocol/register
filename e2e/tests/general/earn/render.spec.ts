import { test, expect } from '../../../harness'

// Earn DeFi tab renders offline. DefiLlama pools are mocked empty by the base
// fixture, so this exercises the empty-state render path. Desktop + mobile.
test.use({ wallet: false })

test('earn defi: renders offline @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await page.goto('/earn/defi')
  await expect(page.getByTestId('earn-defi')).toBeVisible({ timeout: 12_000 })
})
