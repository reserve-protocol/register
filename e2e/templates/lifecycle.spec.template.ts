/**
 * LIFECYCLE SPEC TEMPLATE — copy into e2e/tests/<domain>/<route>/lifecycle.spec.ts
 *
 * A lifecycle test proves the loading UX of ONE data-island architecture. Cover
 * an ARCHITECTURE once (one REST table, one subgraph list, one RPC island, one
 * Multicall3 island, one mixed page) — do NOT repeat it per route/state; that's
 * implementation coupling, not behavior. Delete the guidance once your test is real.
 *
 * WHAT TO PROVE (only the product-relevant ones):
 *  L1 — hold the EXACT boundary (chain + op/path/calldata), prove the hold was
 *       HIT, assert the skeleton's shape/count and that it occupies the loaded
 *       content's box (no reflow).
 *  L2 — release ONE island; assert a peer island did NOT shift/populate/hide.
 *  L3 — the exact loaded value/empty/error inside the release.
 *  Mobile (@mobile) — assert mobile-SPECIFIC chrome (bottom nav, portal menu,
 *       card layout, CTA bar), not the same desktop assertion at a phone width.
 *
 * NOTE: box-stability helpers sample position, not a real CLS budget — use them
 * for "did this island move," not as a layout-shift score.
 */
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

const dtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('DOMAIN lifecycle: skeleton → content, peer stable @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page
  const skeleton = page.getByTestId('DOMAIN-skeleton')

  // L1 — hold the EXACT island boundary (add chain/variables where the matcher
  // supports it, so a same-op request on another chain is NOT frozen too).
  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetDOMAIN' })
  await harness.goto(dtf, 'overview')

  await expect(skeleton.first()).toBeVisible({ timeout: 12_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)
  // (assert skeleton shape/count here where product-relevant)

  // L3 — release into the exact content; skeleton gone.
  hold.release()
  await expect(page.getByTestId('DOMAIN-content').first()).toBeVisible({ timeout: 15_000 })
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
})
