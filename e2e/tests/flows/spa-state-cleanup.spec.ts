import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, REGISTRY, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// SPA cross-chain navigation — state cleanup + chain-init race.
//
// Companion to spa-chain-identity.spec.ts (the subgraph container bug). This
// spec covers the SAME root cause — SDK/price consumers firing before the
// route's chain identity settles — at the REST price boundary, plus the
// positive side: the container's resetState DOES clear the hero, so no stale
// symbol/price from the previous DTF bleeds through.

interface DtfSnapshot {
  dtf: { token: { name: string; symbol: string } }
}

const mainnet = REGISTRY.find((d) => d.chainId === 1 && !d.deprecated)! // open (v4)
const baseDtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap (v5)
const bsc = REGISTRY.find((d) => d.chainId === 56)! // cmc20 (v5)

const symbolOf = (dtf: RegistryDTF) =>
  loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf.token.symbol

// POSITIVE contract: cross-chain nav clears the hero — each DTF shows ITS own
// symbol, never the previous DTF's. resetState (indexDTFAtom -> undefined) fires
// synchronously in the container's useLayoutEffect, so the hero holds a skeleton
// until the new DTF's SDK data lands rather than showing stale identity.
test('cross-chain navigation shows each DTF its own symbol, never a stale one', async ({
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

// Chain-init race at the REST boundary: same root cause as the spa-chain-identity
// subgraph bug (react-zapper's ChainIdUpdater syncing its chain in a lagging
// effect), DIFFERENT boundary — the price consumer fetched `/current/dtf` with
// `chainId=1` for a Base/BSC DTF before the route chain settled. Fixed by seeding
// react-zapper's chainIdAtom synchronously during render. Asserts every
// `/current/dtf` fetch for a DTF targets ITS chain, never mainnet.
test(
  'cross-chain navigation never fetches current/dtf on the wrong chain',
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

// FINDING (missing atom reset): `indexDTFVersionAtom` is NOT cleared by the
// container's resetStateAtom (index-dtf-container.tsx resetStateAtom omits it;
// atom defined in state/dtf/atoms.ts). Navigating from a v5 DTF (base/lcap,
// bsc/cmc20) to a v4 DTF (mainnet/open) leaves the stale v5 version in the atom
// until IndexDTFVersionUpdater refetches and overwrites it. Version gates
// write-ABI selection and version-conditional UI, so version-gated surfaces
// render against the PRIOR DTF's version during that window.
//
// Not asserted here (no stable version-gated testid on the overview to key on)
// — documented for engineer triage. Add resetState coverage for
// indexDTFVersionAtom, then a version-gated e2e assertion becomes possible.
test.fixme('indexDTFVersionAtom is reset on cross-chain navigation', async () => {
  const v4 = findDtfByAddress('0x323c03c48660fe31186fa82c289b0766d331ce21')!
  expect(v4.chainId).toBe(1)
})
