import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield issuance state-space + mobile: an active RToken (eUSD) offers mint AND
// redeem; a protocol-mint-paused one (hyUSD) is redeem-only (mint panel absent).
// Read-only render (no wallet); offline via record/replay.
test.use({ wallet: false })

const eusd = YIELD_REGISTRY.find((d) => d.symbol === 'eUSD')!
const hyusd = YIELD_REGISTRY.find((d) => d.symbol === 'hyUSD')!

async function open(harness: import('../../../harness/controller').DtfHarness, dtf: typeof eusd) {
  setYieldReplay(dtf.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(dtf))
  await harness.gotoYield(dtf, 'issuance')
  // Issuance defaults to the Zap panel — switch to the manual mint/redeem surface.
  const toggle = harness.page.getByTestId('issuance-manual-toggle')
  await expect(toggle).toBeVisible({ timeout: 15_000 })
  await toggle.click()
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
}

test('yield issuance eUSD (active): mint AND redeem panels @smoke @mobile', async ({ harness }) => {
  await open(harness, eusd)
  await expect(harness.page.getByTestId('issuance-redeem-panel')).toBeVisible({ timeout: 15_000 })
  await expect(harness.page.getByTestId('issuance-mint-panel')).toBeVisible({ timeout: 15_000 })
})

test('yield issuance hyUSD (mint-paused): redeem-only, no mint panel @smoke @mobile', async ({
  harness,
}) => {
  await open(harness, hyusd)
  await expect(harness.page.getByTestId('issuance-redeem-panel')).toBeVisible({ timeout: 15_000 })
  await expect(harness.page.getByTestId('issuance-mint-panel')).toHaveCount(0)
})
