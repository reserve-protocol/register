import { test, expect } from '../../../harness'

// Earn index-dtf (vote-lock) + yield-dtf (staking) tabs render offline. Both are
// disconnected empty-state renders (positions need a wallet; the list/DAO data
// is mocked). Previously zero-coverage tabs alongside the covered /earn/defi.
test.use({ wallet: false })

test('earn index-dtf: vote-lock tab renders offline @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page
  await page.goto('/earn/index-dtf')
  await expect(page.getByTestId('earn-index-dtf')).toBeVisible({ timeout: 15_000 })
})

test('earn yield-dtf: staking tab renders offline @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page
  await page.goto('/earn/yield-dtf')
  await expect(page.getByTestId('earn-yield-dtf')).toBeVisible({ timeout: 15_000 })
})
