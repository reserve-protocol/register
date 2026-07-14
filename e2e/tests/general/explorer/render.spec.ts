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

// A1 regression (GH0, REGISTER_HARDENING.md): useTransactionData reads
// `data[chain].entries.map` guarding only `data[chain]`. The crash needs ONE
// chain truthy-but-`entries`-less while the others return real feeds — a shape
// only the chain-scoped override can express (a whole-op override makes every
// chain malformed at once and never reaches the `.map`). Without the `?? []`
// guard the useMemo throws during render → page-level error boundary → the
// whole explorer route blanks, so the healthy chain's row never appears.
//
// RED-verify: revert `(yieldData[chain].entries ?? [])` to
// `yieldData[chain].entries` in useTransactionData.ts — this test must fail.
test('explorer: one chain returning a malformed transactions body must not blank the page @smoke', async ({
  harness,
}) => {
  const page = harness.page
  const HASH = `0x${'ab'.repeat(32)}`
  const entry = {
    id: 'e2e-entry-1',
    type: 'TRANSFER',
    amount: '1000000000000000000',
    amountUSD: '1.02',
    hash: HASH,
    from: { id: '0x1111111111111111111111111111111111111111' },
    to: { id: '0x2222222222222222222222222222222222222222' },
    token: { id: '0x320623b8e4ff03373931769a31fc52a4e78b5d70', symbol: 'RSR' },
    timestamp: 1700000000,
  }

  // Healthy feed everywhere...
  harness.mock.subgraph({ operationName: 'Transactions' }, { entries: [entry] })
  // ...except base: truthy response body MISSING `entries` (partial/drifted shape).
  harness.mock.subgraph({ operationName: 'Transactions', chain: 8453 }, {})

  await page.goto('/explorer')

  // The healthy chain's row renders (its explorer link carries our tx hash) —
  // which also proves the multichain data actually landed, so the malformed
  // base body reached the unguarded read path.
  await expect(page.locator(`a[href*="${HASH}"]`).first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByTestId('explorer-page')).toBeVisible()
})
