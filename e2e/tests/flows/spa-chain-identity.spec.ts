import { expect, test } from '../../fixtures/base'
import { dtfPath, REGISTRY } from '../../helpers/registry'

// SPA cross-chain identity — regression test for the chain-init race.
//
// react-zapper's `ChainIdUpdater` synced its `chain` prop into the widget's
// internal `chainIdAtom` in a useEffect that lagged the first render, so the
// DTF/basket updaters fired `getDTF` against the default (mainnet) subgraph
// before the route's chain landed. Fixed by seeding that atom synchronously
// during render (react-zapper >= 2.5.1 fix branch). This asserts the contract:
// every DTF-bearing subgraph request reaches its registry chain's host.
//
// The e2e mock resolves index subgraph by globally-unique address so the rest
// of the suite stays green regardless; this spec is the one place the contract
// is asserted at the request boundary.

const mainnet = REGISTRY.find((d) => d.chainId === 1 && !d.deprecated)! // open
const baseDtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap
const bsc = REGISTRY.find((d) => d.chainId === 56)! // cmc20

test(
  'SPA cross-chain navigation: every DTF subgraph query hits its registry chain host',
  async ({ page, boundaryRequests }) => {
    // 1. Open a mainnet DTF.
    await page.goto(dtfPath(mainnet, 'overview'))
    await expect(page.getByTestId('overview-dtf-symbol')).toBeVisible({ timeout: 15_000 })

    // 2 + 3. Navigate cross-chain WITHOUT a page reload (SPA route change).
    for (const dtf of [baseDtf, bsc]) {
      await page.goto(dtfPath(dtf, 'overview'))
      await expect(page.getByTestId('overview-dtf-symbol')).toBeVisible({ timeout: 15_000 })

      // 4. Every subgraph request naming THIS DTF must have hit THIS chain's
      // host — no request to another chain's subgraph for this DTF.
      const dtfRequests = boundaryRequests.filter(
        (r) =>
          r.boundary === 'subgraph' &&
          JSON.stringify(r.variables).toLowerCase().includes(dtf.address.toLowerCase())
      )
      expect(dtfRequests.length).toBeGreaterThan(0)
      for (const r of dtfRequests) {
        expect(r.boundary === 'subgraph' && r.urlChain).toBe(dtf.chainId)
      }
    }
  }
)
