import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Settings fee-math edge (ledger M9 / B2): a fee registry with
// numerator==denominator yields platformFee=100 → PERCENT_ADJUST =
// 100/(100-100) = Infinity → every recipient share collapses to 0%/NaN%.
// A 100% platform fee is a degenerate/invalid split, so the revenue distribution
// must fail closed to an explicit "Unavailable" state — never a fabricated
// numeric allocation.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('settings: platformFee=100 shows Unavailable, not a fabricated split @smoke', async ({
  harness,
}) => {
  const page = harness.page
  harness.seedFeeRegistry(base, 1n, 1n) // 100% platform fee
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'settings')
  await expect(page.getByTestId('dtf-settings')).toBeVisible({ timeout: 15_000 })
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  // Revenue distribution fails closed to Unavailable.
  await expect(page.getByTestId('settings-fee-unavailable')).toBeVisible({
    timeout: 15_000,
  })
  // No fabricated numeric recipient split renders.
  await expect(page.getByTestId('settings-fee-platform')).toHaveCount(0)
  await expect(page.getByTestId('settings-fee-governance')).toHaveCount(0)
})
