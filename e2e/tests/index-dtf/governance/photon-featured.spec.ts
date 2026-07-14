import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// PHOTON (BSC) is a live "featured" DTF with a full governance history (8
// captured proposals spanning EXECUTED / QUEUED / ACTIVE). It is the suite's
// only 5th-DTF fixture and the only governance surface driven by real BSC data
// through the full mock stack — proving the harness scales to another
// chain×DTF without any spec-local plumbing.
const photon = REGISTRY.find((d) => d.slug === 'photon')!

// Read-only list; a disconnected visitor is a real, supported governance state
// (and skips the wallet basket-balance reads a connected session would make).
test.use({ wallet: false })

test('governance: PHOTON featured list renders real proposal history @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page
  await harness.goto(photon, 'governance')

  // The proposals card resolves from real captured data (no override, no seed).
  const card = page.getByTestId('governance-proposals').first()
  await expect(card).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('governance-list-skeleton')).toHaveCount(0, {
    timeout: 15_000,
  })
})

// NOTE (coverage debt — see docs/wiki/progress.md § E2E coverage debt): PHOTON's
// owner+trading governance are optimistic (isOptimistic=true on-chain), but the
// OptimisticBadge is keyed on the *proposal's* subgraph `isOptimistic`, and ALL
// 8 captured PHOTON proposals were submitted standard (isOptimistic=false at the
// subgraph — verified live). So the badge / optimistic proposal-flow path is not
// reachable from real captured data. Covering it needs either a fixture with a
// real optimistic proposal, or a GetIndexDtfProposals overlay helper.
