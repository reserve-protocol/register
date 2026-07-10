import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the Index-DTF auctions page (rebalance list, v5 new UI) renders fully
// offline in its idle / no-active-rebalance state. LIVE rebalance state comes
// from RPC getRebalance() (answered idle by the shared rpc table at selector
// 0xaa3b5568), NOT the subgraph — getRebalances is history only. @smoke fails
// on ANY unmocked boundary call.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

interface RebalancesSnapshot {
  rebalances: Array<{ availableUntil: string }>
}

// Latest availableUntil across the captured rebalances — freezing just past it
// pins EVERY rebalance into the historical bucket (idle: no active auction),
// robust as snapshots age.
function idleTime(): number {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { rebalances } = loadSnapshot<RebalancesSnapshot>(
    `${dtf.snapshotDir}/rebalances.json`
  )
  const maxAvailableUntil = Math.max(...rebalances.map((r) => Number(r.availableUntil)))
  return maxAvailableUntil + 86_400 // +1 day
}

test('auctions list renders idle offline @smoke', async ({ page }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { rebalances } = loadSnapshot<RebalancesSnapshot>(
    `${dtf.snapshotDir}/rebalances.json`
  )

  // Freeze past every rebalance's expiry so the list is all-historical (idle).
  await freezeTime(page, idleTime())

  await page.goto(dtfPath(dtf, 'auctions'))

  // The auctions container mounts immediately (v5 new UI, version-gated).
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Pump 1 — flush GetIndexDTF: indexDTFAtom hydrates, which ENABLES the
  // dependent getRebalances + proposal-list queries (they only fire once dtf.id
  // exists). A paused clock freezes react-query's notifyManager, so nothing
  // reaches React until time advances.
  await advanceTime(page, 5_000)
  // Pump 2 — flush getRebalances + proposal list into React so the list can
  // bucket rows (rebalancesAtom × governanceProposalsAtom by executionBlock).
  await advanceTime(page, 5_000)

  // Every captured rebalance matches a proposal by executionBlock, so the
  // historical section renders one row per snapshot entry.
  await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible()
  await expect(page.getByTestId('auctions-historical-item')).toHaveCount(
    rebalances.length
  )

  // Idle: no active rebalance — the active section shows its empty state.
  await expect(page.getByTestId('auctions-active-item')).toHaveCount(0)
  await expect(
    page.getByTestId('auctions-active-section').getByTestId('auctions-empty-state')
  ).toBeVisible()
})
