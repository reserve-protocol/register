import { expect, test } from '../../fixtures/base'
import { freezeTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the Index-DTF auctions page (rebalance list, v5 new UI) mounts fully
// offline with its list shell — the `dtf-auctions` container plus the Active /
// Historical sections. @smoke fails on ANY unmocked boundary call, so a green
// run proves the route renders without touching a live RPC/subgraph/API.
//
// NOTE (blocked, see report): the rebalance ITEMS (historical/active rows) can't
// be asserted yet — they need `indexDTFAtom`, which is fed by the SDK's
// `sdk.index.get` (GetIndexDTF). The committed `dtf.json` snapshot is the
// SDK-PROCESSED shape, but `sdk.index.get` re-parses it as a raw goldsky
// response and throws at `mapPriceControl(undefined)` (snapshot has no
// `priceControl`/`weightControl`/`bidsEnabled`/`admins`). Until the shared
// snapshot is re-captured in raw shape, `indexDTFAtom` never hydrates and the
// list shows loading skeletons instead of rows. The section containers below
// render regardless, so this smoke stays valid before AND after that fix.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

interface RebalancesSnapshot {
  rebalances: Array<{ availableUntil: string }>
}

// Latest availableUntil across the captured rebalances — freezing just past it
// pins every rebalance into the historical bucket (idle: no active auction),
// robust as snapshots age. Used to pin the idle state once items render.
function idleTime(): number {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { rebalances } = loadSnapshot<RebalancesSnapshot>(
    `${dtf.snapshotDir}/rebalances.json`
  )
  const maxAvailableUntil = Math.max(...rebalances.map((r) => Number(r.availableUntil)))
  return maxAvailableUntil + 86_400 // +1 day
}

test('auctions list renders its shell offline @smoke', async ({ page, overrides }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!

  // Freeze past every rebalance's expiry so the list resolves to all-historical
  // (idle) once item rendering is unblocked.
  await freezeTime(page, idleTime())

  // Historical MetricsRow polls api.reserve.org/dtf/rebalance (not in the shared
  // api helper — see report). Serve empty so that, once items render, metrics
  // degrade to dashes and no unmocked call trips the smoke gate.
  overrides.api('dtf/rebalance', [])

  await page.goto(dtfPath(dtf, 'auctions'))

  // The auctions container mounts immediately (v5 new UI, version-gated).
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Pump — flush react-query: a paused clock freezes the notifyManager, so any
  // query-driven content resolves but never reaches React until time advances.
  await page.clock.runFor(5_000)

  // The list shell renders offline: the list container plus both sections.
  await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible()
  await expect(page.getByTestId('auctions-active-section')).toBeVisible()
  await expect(page.getByTestId('auctions-historical-section')).toBeVisible()
})
