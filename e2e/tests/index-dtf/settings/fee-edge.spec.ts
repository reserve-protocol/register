import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Settings fee-math edge (ledger M9): a fee registry with numerator==denominator
// yields platformFee=100 → PERCENT_ADJUST = 100/(100-100) = Infinity → every
// recipient share collapses to 0%. Desired: a coherent breakdown (the DTF's
// governance recipient keeps a non-zero share). See E2E_BUG_LEDGER.md M9.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test.fixme('settings: platformFee=100 must not zero every recipient share @smoke', async ({
  harness,
}) => {
  const page = harness.page
  harness.seedFeeRegistry(base, 1n, 1n) // 100% platform fee
  await harness.chain.freezeAt(Math.floor(Date.now() / 1000))
  await harness.goto(base, 'settings')
  await expect(page.getByTestId('dtf-settings')).toBeVisible({ timeout: 15_000 })
  await harness.chain.advance(5_000)
  await harness.chain.advance(5_000)

  await expect(page.getByTestId('settings-fee-platform')).toContainText('100', { timeout: 15_000 })
  // Desired: the governance recipient keeps its real (non-zero) share.
  await expect(page.getByTestId('settings-fee-governance')).toContainText(/[1-9]/)
})
