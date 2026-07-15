import { expect, test } from '../../fixtures/base'
import { dtfPath, REGISTRY, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// DTF→DTF navigation — state cleanup + chain-init race.
//
// Companion to reload-chain-identity.spec.ts (the subgraph container bug).
// The first two tests use `page.goto` — DOCUMENT navigations that boot a fresh
// runtime — so they cover the fresh-load init race (deep links), NOT
// same-runtime SPA state. The Z21 test at the bottom drives a real in-app
// router navigation for the same-runtime contract.

interface DtfSnapshot {
  dtf: { token: { name: string; symbol: string } }
}

const mainnet = REGISTRY.find((d) => d.chainId === 1 && !d.deprecated)! // open (v4)
const baseDtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap (v5)
const bsc = REGISTRY.find((d) => d.chainId === 56)! // cmc20 (v5)

const symbolOf = (dtf: RegistryDTF) =>
  loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf.token.symbol

// POSITIVE contract: each fresh cross-chain load shows the DTF's own symbol,
// never another DTF's. resetState (indexDTFAtom -> undefined) fires
// synchronously in the container's useLayoutEffect, so the hero holds a skeleton
// until the new DTF's SDK data lands rather than showing stale identity.
test('full reload cross-chain: each DTF shows its own symbol, never a stale one', async ({
  page,
}) => {
  for (const dtf of [mainnet, baseDtf, bsc, mainnet]) {
    await page.goto(dtfPath(dtf, 'overview'))
    // The symbol cell settling on THIS DTF's symbol proves no stale carryover:
    // if the previous DTF's identity leaked, we'd briefly (or permanently) read
    // the wrong symbol here.
    await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
      `$${symbolOf(dtf)}`,
      { timeout: 20_000 }
    )
    // Price hero resolves to a well-formed dollar amount for the current DTF.
    await expect(page.getByTestId('overview-dtf-price')).toHaveText(
      /^\$[\d,]+(\.\d+)?$/
    )
  }
})

// Chain-init race at the REST boundary: same root cause as the
// reload-chain-identity subgraph bug (react-zapper's ChainIdUpdater syncing its
// chain in a lagging effect), DIFFERENT boundary — the price consumer fetched
// `/current/dtf` with `chainId=1` for a Base/BSC DTF before the route chain
// settled. Fixed by seeding react-zapper's chainIdAtom synchronously during
// render. Asserts every `/current/dtf` fetch for a DTF targets ITS chain.
test(
  'full reload cross-chain: never fetches current/dtf on the wrong chain',
  async ({ page, boundaryRequests }) => {
    await page.goto(dtfPath(mainnet, 'overview'))
    await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
      `$${symbolOf(mainnet)}`,
      { timeout: 20_000 }
    )

    for (const dtf of [baseDtf, bsc]) {
      await page.goto(dtfPath(dtf, 'overview'))
      await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
        `$${symbolOf(dtf)}`,
        { timeout: 20_000 }
      )

      const currentPriceForDtf = boundaryRequests.filter(
        (r) =>
          r.boundary === 'api' &&
          r.pathname === '/current/dtf' &&
          (r.search.address ?? '').toLowerCase() === dtf.address.toLowerCase()
      )
      expect(currentPriceForDtf.length).toBeGreaterThan(0)
      for (const r of currentPriceForDtf) {
        if (r.boundary !== 'api') continue
        // Every price fetch for this DTF must target ITS chain, not chain 1.
        expect(r.search.chainId).toBe(String(dtf.chainId))
      }
    }
  }
)

// FIXED (M1/Z21): `indexDTFVersionAtom` is now cleared by
// resetIndexDTFAtomsAtom (state/dtf/reset-index-dtf-atoms.ts) together with the
// transactions/market-cap mirrors, and the reset list is unit-pinned in
// state/dtf/tests/reset-index-dtf-atoms.test.ts. A version-gated e2e observable
// (`data-dtf-version` on a version-conditional surface) is still the missing
// piece for an end-to-end regression — tracked in docs/plans/E2E_BUG_LEDGER.md;
// a placeholder spec that can't fail for the root cause stays out on purpose
// (CODEX HARN-021 / IDX-OVR-013).

// Z21 (atom leaks): DTF→DTF SPA navigation (in-app click, NO reload) must clear
// the per-DTF stat mirrors — indexDTFTransactionsAtom (tx volume / 24h supply)
// and indexDTFMarketCapAtom. Without their resetIndexDTFAtomsAtom entries the
// PREVIOUS DTF's values keep painting inside the next DTF's load window. The
// destination's mcap/tx sources are held open so that window is observable.
test(
  'SPA DTF→DTF nav: stat cards never show the prior DTF mcap/tx volume',
  async ({ page, overrides }) => {
    await page.goto(dtfPath(baseDtf, 'overview'))
    // Fees & Stats duplicates cards for the mobile/desktop layouts — scope to
    // the visible copy.
    const mcap = page.locator('[data-testid="overview-mcap"]:visible')
    const txVolume = page.locator('[data-testid="overview-tx-volume"]:visible')
    await expect(mcap).toHaveText(/^\$[\d,]+/, { timeout: 20_000 })
    await expect(txVolume).toHaveText(/^\$[\d,]+/, { timeout: 20_000 })
    const priorMcap = (await mcap.textContent())!

    // Park the destination's mcap (historical/dtf REST) and transactions
    // (anonymous transferEvents subgraph query) so the load window stays open.
    const holdHistory = overrides.holds.add({
      boundary: 'api',
      pathname: '/historical/dtf',
    })
    const holdTransfers = overrides.holds.add({
      boundary: 'subgraph',
      operationName: '',
    })

    // Real SPA navigation: top nav → discover → click the destination's row.
    await page.locator('a[href="/discover"]').first().click()
    const table = page.getByTestId('discover-dtf-table')
    await expect(table).toBeVisible()
    await table
      .locator('table tbody tr')
      .filter({ hasText: symbolOf(bsc) })
      .first()
      .click()
    await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
      `$${symbolOf(bsc)}`,
      { timeout: 20_000 }
    )

    // Load window: the mirrors were reset, so the cards hold skeletons — the
    // prior DTF's values must not be present anywhere in the stat cards.
    await expect(
      page.locator('[data-testid="overview-mcap-loading"]:visible')
    ).toBeVisible()
    await expect(mcap).toHaveCount(0)
    await expect(
      page.locator('[data-testid="overview-tx-volume-loading"]:visible')
    ).toBeVisible()
    await expect(txVolume).toHaveCount(0)

    // The destination's parked sources were actually requested — the skeletons
    // above are a held load window, not a dead data path.
    expect(holdHistory.hits).toBeGreaterThan(0)
    expect(holdTransfers.hits).toBeGreaterThan(0)

    // Release: the destination's own values resolve. Mcap snapshots are real,
    // distinct numbers so the inequality holds; 24h tx volume is legitimately
    // $0 for both registry DTFs (old snapshot txs), so only resolution is
    // asserted there — the load-window assertions above carry the regression.
    holdHistory.release()
    holdTransfers.release()
    await expect(mcap).toHaveText(/^\$[\d,]+/, { timeout: 20_000 })
    await expect(mcap).not.toHaveText(priorMcap)
    await expect(txVolume).toHaveText(/^\$[\d,]+/, { timeout: 20_000 })
  }
)
