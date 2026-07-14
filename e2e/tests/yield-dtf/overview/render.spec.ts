import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield overview renders offline (record/replay) — desktop + mobile. Adds the
// mobile dimension to the yield overview (previously desktop-render-only, no testid).
test.use({ wallet: false })

const eusd = YIELD_REGISTRY.find((d) => d.symbol === 'eUSD')!

test('yield overview: renders offline @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  await harness.gotoYield(eusd, 'overview')
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
  await expect(page.getByTestId('yield-overview')).toBeVisible({ timeout: 15_000 })
})
