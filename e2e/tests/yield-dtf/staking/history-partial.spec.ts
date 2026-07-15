import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

// Z38 (docs/plans/REGISTER_HARDENING.md): StakeHistory (live on the staking
// route under the "Staked RSR" tab) reads `data.rtoken?.snapshots.map` —
// guarding only `rtoken`. A partial subgraph response (rtoken present, snapshots
// absent) threw on the render path and blanked the staking page. The guard
// defaults the array; this spec drives the real tab so the component mounts and
// proves it survives the partial response.
//
// RED-verify: revert the `?? []` guard in stake-history.tsx → this fails
// (staking-apy is gone) because the throw hits the page error boundary.
test.use({ wallet: false })

const eusd = YIELD_REGISTRY[0]

test('yield staking: staked-history survives a snapshots-less response @smoke @mobile', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)

  // Partial response: the rtoken bucket is present but has no `snapshots`.
  overrides.subgraph({ operationName: 'getStakingDaily' }, { rtoken: {} })

  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  await harness.gotoYield(eusd, 'staking')

  await expect(page.getByTestId('staking-tab-staked')).toBeVisible({
    timeout: 15_000,
  })

  // Mount StakeHistory (the tab is lazy + inactive by default) and pump the
  // partial response into it.
  await page.getByTestId('staking-tab-staked').click()
  for (let i = 0; i < 6; i++) await harness.chain.advance(4_000)

  // Panel-owned oracle: the staked-history chart itself renders (proves the live
  // StakeHistory mounted and survived the snapshots-less response). Without the
  // guard this throws → the panel/page blanks.
  await expect(page.getByTestId('staking-history-panel')).toBeVisible({
    timeout: 15_000,
  })
  // Extra no-blank-page check.
  await expect(page.getByTestId('staking-apy')).toBeVisible()
})
