import { test, expect } from '../../../harness'

// Explorer — a general (non-DTF) surface with 5 tabs, previously zero-coverage.
// Disconnected: the explorer reads no wallet state to render. Cross-chain
// subgraph queries are modelled empty-but-correctly-shaped centrally (subgraph.ts).
test.use({ wallet: false })

test('explorer: transactions tab (default route) renders offline @smoke', async ({
  harness,
}) => {
  const page = harness.page
  await page.goto('/explorer')
  await expect(page.getByTestId('explorer-page')).toBeVisible({ timeout: 15_000 })
})

test('explorer: governance tab renders the proposals surface @smoke', async ({
  harness,
}) => {
  const page = harness.page
  await page.goto('/explorer/governance')
  await expect(page.getByTestId('explorer-page')).toBeVisible({ timeout: 15_000 })
})

// NO A1/A2 REGRESSION TEST HERE — ON PURPOSE, and this is a real lesson.
//
// A1 (`useTransactionData`, useMemo, `data[chain].entries.map`) and A2
// (`use-proposals-data`, queryFn, `governanceRes.dtfs` / `result.proposals`) are
// both guarded with `?? []` now. Both were tagged "CONFIRMED / reproduced" in
// REGISTER_HARDENING.md via `test.fixme` blocks — but a `fixme` is SKIPPED, so
// those repros were never actually executed. When run for real this pass, NEITHER
// reproduces through the mock harness:
//
//  • A1: a whole-op `overrides.subgraph({operationName:'Transactions'}, {})` makes
//    the multichain query resolve to `data = {}` (or reject as a whole — e.g. the
//    deprecated Arbitrum chain in `supportedChainList` has no index client), so
//    `data[chain]` is falsy / `data` is undefined and the `.map` line is never
//    reached. The bug needs one chain truthy-but-`entries`-less while the others
//    succeed — a per-chain shape the op-level override can't express.
//  • A2: the loops live inside a react-query `queryFn`, so an unguarded throw is
//    caught as query-error state — it never blanks the page. A page-level
//    "explorer-page visible" assertion passes with or without the guard.
//
// So an e2e test here would be a FALSE GREEN (it passes without the fix). The
// guards are kept as correct defensive hygiene; a faithful test needs either a
// per-chain override primitive (harness gap) or extracting the pure transform for
// a unit test. Tracked in REGISTER_HARDENING.md A1/A2 and the coverage-debt list.
