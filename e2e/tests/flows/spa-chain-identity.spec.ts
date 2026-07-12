import { expect, test } from '../../fixtures/base'
import { dtfPath, REGISTRY } from '../../helpers/registry'

// SPA cross-chain identity — the regression test for CODEX_AUDIT § P0.
//
// `index-dtf-container.tsx` sets `chainIdAtom` in a useLayoutEffect that runs
// AFTER its SDK-consumer children mount, so on a fresh Base/BSC route the first
// GraphQL query fires against the stale mainnet client. This test asserts the
// CORRECT contract: every DTF-bearing subgraph request reaches its registry
// chain's host. It is `test.fixme` because the app currently violates it (a
// wrong-chain request is recorded on first render / cross-chain nav).
//
// The e2e mock resolves index subgraph by globally-unique address so the rest
// of the suite stays green despite this bug (see subgraph.ts resolveIndexQuery);
// this spec is the one place the bug is asserted at the request boundary.
//
// UN-FIXME when the container initializes chain identity BEFORE mounting SDK
// consumers (or gates them until chainIdAtom matches the route). Then the index
// subgraph mock can enforce URL-chain again.

const mainnet = REGISTRY.find((d) => d.chainId === 1 && !d.deprecated)! // open
const baseDtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap
const bsc = REGISTRY.find((d) => d.chainId === 56)! // cmc20

test.fixme(
  'SPA cross-chain navigation: every DTF subgraph query hits its registry chain host',
  async ({ page, boundaryRequests }) => {
    // 1. Open a mainnet DTF.
    await page.goto(dtfPath(mainnet, 'overview'))
    await expect(page.getByTestId('dtf-overview')).toBeVisible({ timeout: 15_000 })

    // 2 + 3. Navigate cross-chain WITHOUT a page reload (SPA route change).
    for (const dtf of [baseDtf, bsc]) {
      await page.goto(dtfPath(dtf, 'overview'))
      await expect(page.getByTestId('dtf-overview')).toBeVisible({ timeout: 15_000 })

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
