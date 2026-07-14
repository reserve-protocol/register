/**
 * READ SPEC TEMPLATE — copy into e2e/tests/<domain>/<route>/<name>.spec.ts
 *
 * A read test proves the page renders the RIGHT semantic values from the RIGHT
 * boundary — not that an outer wrapper mounted. A wrapper-visible check is NOT
 * coverage; the error boundary can leave the wrapper up while the child crashed.
 * Delete the guidance comments once your test is real.
 *
 * MINIMUM ORACLE:
 *  1. Assert SNAPSHOT-DERIVED semantic values (loadSnapshot / helpers) — never a
 *     hardcoded number (a re-capture must not break the test) and never Lingui
 *     copy (assert testids, values, hrefs, counts).
 *  2. Distinguish loading vs EMPTY vs ERROR — add only product-DISTINCT states,
 *     not one test per skeleton.
 *  3. Zero unmodeled calls (strict teardown) AND correct chain host.
 *
 * RULES: data-testid selectors only. Pick the fixture by chain from the registry.
 */
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

const dtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // base/lcap (v5)

// Read-only pages usually don't need a wallet — opt out to skip the connect reads.
test.use({ wallet: false })

test('DOMAIN: <surface> renders <the real value> @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page

  // Derive the EXPECTED value from the snapshot, not a literal.
  const { dtf: snap } = loadSnapshot<{ dtf: { symbol: string } }>(
    `${dtf.snapshotDir}/dtf.json`
  )

  await harness.goto(dtf, 'overview')

  // Assert the semantic content — a value/count/href, keyed by testid.
  await expect(page.getByTestId('DOMAIN-value')).toContainText(snap.symbol, {
    timeout: 15_000,
  })

  // If the surface has a distinct EMPTY or ERROR state, add ONE test per
  // product-distinct state (overlay the boundary to produce it), e.g.:
  //   overrides.subgraph({ operationName: 'X' }, { items: [] })  → assert empty state
  //   overrides.subgraph({ operationName: 'X' }, {})             → assert error state (NOT loading)
})
