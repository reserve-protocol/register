import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Yield staking renders the exchange-rate + APY offline (record/replay), on BOTH
// desktop and mobile — adds the mobile dimension to yield (previously
// desktop-render-only). Read-only, so no wallet (avoids position/withdraw reads).
test.use({ wallet: false })

const eusd = YIELD_REGISTRY[0]

test('yield staking: exchange-rate + APY render offline @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  await harness.gotoYield(eusd, 'staking')

  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)

  await expect(page.getByTestId('staking-exchange-rate')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('staking-apy')).toBeVisible()
})
