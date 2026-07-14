import { test, expect } from '../../../harness'

// Explorer — a general (non-DTF) surface with 5 tabs, previously zero-coverage.
// Disconnected: the explorer reads no wallet state to render. Cross-chain
// subgraph queries are modelled empty-but-correctly-shaped centrally (subgraph.ts).
//
// COVERAGE DEBT: the transactions tab (default route) has NO committed render
// spec — GH0 crashes it under load (the deprecated Arbitrum chain in
// supportedChainList is still queried and yields an entries-less shape → the
// unguarded `.map` throws). Committing that render would ship a flaky spec.
// The GH0 fixme below is its stand-in until the guard lands; then add the render.
test.use({ wallet: false })

test('explorer: governance tab renders the proposals surface @smoke', async ({
  harness,
}) => {
  const page = harness.page
  await page.goto('/explorer/governance')
  await expect(page.getByTestId('explorer-page')).toBeVisible({ timeout: 15_000 })
})

// GH0 — CONFIRMED crash (engineer triage): useTransactionData
// (src/views/explorer/components/transactions/useTransactionData.ts:111-113)
// guards `if (data[chain])` but then reads `data[chain].entries.map(...)`
// UNguarded. A per-chain response without `entries` (subgraph error / partial /
// schema drift) throws "Cannot read properties of undefined (reading 'map')" and
// the app's error boundary replaces the ENTIRE explorer landing page with
// "An unexpected error occurred". Fix: `(data[chain]?.entries ?? []).map(...)`.
// Un-fixme once the guard lands.
test.fixme(
  'explorer: transactions tab survives a subgraph response missing entries @smoke',
  async ({ harness, overrides }) => {
    const page = harness.page
    // A truthy per-chain response with no `entries` field — exactly what the
    // guard misses (data[chain] is set, data[chain].entries is undefined).
    overrides.subgraph({ operationName: 'Transactions' }, {})

    await page.goto('/explorer')
    await expect(page.getByTestId('explorer-page')).toBeVisible({ timeout: 15_000 })
    // The error-boundary heading must NOT appear (it does today — the bug).
    await expect(page.getByText('An unexpected error')).toHaveCount(0)
  }
)
