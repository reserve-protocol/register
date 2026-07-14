import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime } from '../../helpers/clock'
import { YIELD_REGISTRY, rtokenPath } from '../../helpers/registry'
import { setYieldReplay } from '../../helpers/rpc'
import { yieldPinnedTimestamp, yieldTokenMeta } from '../../helpers/yield'

// Smoke: a Yield-DTF (RToken) overview renders name / symbol / price / backing
// fully offline from the captured eth_call record/replay map + yield subgraph
// snapshots (scripts/capture-yield.ts). Yield views read almost everything from
// RPC via vendored ABIs, so the proof here is that the record/replay layer feeds
// the WHOLE page with ZERO unmocked boundary calls. @smoke fails on any of them.

for (const dtf of YIELD_REGISTRY) {
  test(`${dtf.symbol} overview renders offline from captured RPC + subgraph @smoke`, async ({
    page,
  }) => {
    const { name, symbol } = yieldTokenMeta(dtf)

    await freezeTime(page, yieldPinnedTimestamp(dtf))
    setYieldReplay(dtf.chainId)

    await page.goto(rtokenPath(dtf, 'overview'))

    // Hero name + symbol come from the rTokenAtom RPC read chain (name/symbol
    // via getTokenReadCalls). Pump the frozen clock so react-query's
    // notifyManager flushes the loadable chain: rTokenAtom ->
    // rTokenContractsAtom -> rTokenStateUpdater -> backing distribution.
    await expect(page.getByText(name, { exact: false })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(`(${symbol})`, { exact: false })).toBeVisible()

    for (let i = 0; i < 5; i++) await advanceTime(page, 4_000)

    // Price: the hero market-cap figure only renders once PriceUpdater resolves
    // rTokenPrice (FacadeRead.price) AND rsrPrice (captured Chainlink RSR/USD) —
    // a "$" amount proves the full price pipeline replayed.
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible({ timeout: 15_000 })

    // Backing: backing-overview renders "1 <symbol>" once the basket breakdown
    // (FacadeRead.basketBreakdown/backingOverview) resolves from the captured
    // map. (Overview has no testids yet — Phase S should add them; first() is
    // the backing-overview node in DOM order.)
    await expect(page.getByText(`1 ${symbol}`, { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    })
  })
}
