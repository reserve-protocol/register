import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime } from '../../helpers/clock'
import { YIELD_REGISTRY, rtokenPath } from '../../helpers/registry'
import { setYieldReplay } from '../../helpers/rpc'
import { yieldPinnedTimestamp, yieldTokenMeta } from '../../helpers/yield'

// Smoke: a Yield-DTF (RToken) staking view renders the overview stats fully
// offline from the captured record/replay map. Read-only (no wallet): the
// StRSR exchange rate (rTokenState RPC read) and estimated APY (basket-yield
// derived) render without an account; the position/withdraw panels stay empty.
// @smoke fails on any unmocked boundary call.

for (const dtf of YIELD_REGISTRY) {
  test(`${dtf.symbol} staking renders exchange-rate + APY offline @smoke`, async ({ page }) => {
    const { symbol } = yieldTokenMeta(dtf)

    await freezeTime(page, yieldPinnedTimestamp(dtf))
    setYieldReplay(dtf.chainId)

    await page.goto(rtokenPath(dtf, 'staking'))

    // The stake container renders regardless of wallet — a structural anchor
    // that the staking route mounted for this fixture.
    await expect(page.getByText(symbol, { exact: false }).first()).toBeVisible({ timeout: 15_000 })

    for (let i = 0; i < 5; i++) await advanceTime(page, 4_000)

    // Exchange rate: the StRSR/RSR figure only renders once rTokenStateAtom
    // resolves exchangeRate from the captured map (falsy rate shows a loader),
    // so a "<n> RSR" value proves the state pipeline replayed.
    const rate = page.getByTestId('staking-exchange-rate')
    await expect(rate).toBeVisible({ timeout: 15_000 })
    await expect(rate).toHaveText(/[\d,.]+\s*RSR/)

    // Est. staking yield always renders a percentage (0% when yields are
    // absent), proving the APY node mounted.
    const apy = page.getByTestId('staking-apy')
    await expect(apy).toBeVisible()
    await expect(apy).toHaveText(/%/)
  })
}
