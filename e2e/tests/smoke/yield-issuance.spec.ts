import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime } from '../../helpers/clock'
import { YIELD_REGISTRY, rtokenPath } from '../../helpers/registry'
import { setYieldReplay } from '../../helpers/rpc'
import { yieldPinnedTimestamp, yieldTokenMeta } from '../../helpers/yield'

// Smoke: a Yield-DTF (RToken) issuance view renders the manual mint + redeem
// surface fully offline from the captured record/replay map. Read-only (no
// wallet): the mint/redeem panels render from rTokenState/basket RPC reads;
// account-parameterized reads (maxIssuable, balances, allowances) are guarded
// off without a connected account. @smoke fails on any unmocked boundary call.

for (const dtf of YIELD_REGISTRY) {
  test(`${dtf.symbol} issuance renders manual mint/redeem offline @smoke`, async ({ page }) => {
    const { symbol } = yieldTokenMeta(dtf)

    await freezeTime(page, yieldPinnedTimestamp(dtf))
    setYieldReplay(dtf.chainId)

    await page.goto(rtokenPath(dtf, 'issuance'))

    // Issuance defaults to the Zap panel; switch to the manual mint/redeem
    // surface (the read-only, RPC-only path). The toggle is a structural testid.
    const toggle = page.getByTestId('issuance-manual-toggle')
    await expect(toggle).toBeVisible({ timeout: 15_000 })
    await toggle.click()

    for (let i = 0; i < 5; i++) await advanceTime(page, 4_000)

    // Redeem is the universal manual-surface anchor: active RTokens render
    // mint+redeem, but a protocol-paused/inactive one (e.g. hyUSD, mint paused
    // on-chain) renders redeem-only. Its CTA carries the rToken symbol
    // (snapshot-derived, not copy), proving rTokenAtom resolved from the replay
    // map rather than a stub.
    const redeem = page.getByTestId('issuance-redeem-panel')
    await expect(redeem).toBeVisible({ timeout: 15_000 })
    await expect(redeem.getByText(symbol, { exact: false })).toBeVisible()

    // Mint panel renders only when minting is enabled for the fixture; assert it
    // for the active case. hyUSD mint is protocol-paused → redeem-only (see the
    // E2E coverage-debt note); when present it too carries the symbol.
    const mint = page.getByTestId('issuance-mint-panel')
    if (await mint.count()) {
      await expect(mint).toBeVisible()
      await expect(mint.getByText(symbol, { exact: false })).toBeVisible()
    }
  })
}
