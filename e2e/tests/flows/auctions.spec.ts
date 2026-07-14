import { decodeFunctionData, multicall3Abi, type Hex } from 'viem'
import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime, rebalanceTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import type { BoundaryRequest } from '../../helpers/requests'
import {
  encodeActiveRebalance as encodeActiveRebalanceShared,
  loadRebalances as loadRebalancesShared,
  proposalIdFor as proposalIdForShared,
  type Rebalance,
} from '../../helpers/rebalance-tuple'

// Rebalance / auctions flows on base/lcap (v5).
//
// LIVE rebalance/auction state comes from RPC getRebalance() (selector
// 0xaa3b5568), NOT the subgraph — getRebalances is history only. The shared rpc
// table answers getRebalance() with an encoded EMPTY rebalance (idle) by
// default; the active-detail test overrides it per-address with a tuple built
// from the snapshot's own limits/tokens.
//
// The list buckets rebalances by comparing availableUntil against the frozen
// clock: rebalanceTime(r,'restricted') lands INSIDE the window (active row),
// past the max availableUntil everything is historical. All captured lcap
// rebalances have a zero-width window (restrictedUntil == availableUntil,
// captured post-completion), so 'restricted' is the only in-window phase —
// 'permissionless' (restrictedUntil + 60) is already past availableUntil.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

// Thin wrappers pinning the shared rebalance-tuple helpers to this file's DTF,
// so every call site below stays argument-free.
const localDtf = () => findDtfByAddress(DTF_ADDRESS)!
const loadRebalances = (): Rebalance[] => loadRebalancesShared(localDtf())
const proposalIdFor = (rebalance: Rebalance): string =>
  proposalIdForShared(localDtf(), rebalance)

function idleTime(): number {
  const max = Math.max(...loadRebalances().map((r) => Number(r.availableUntil)))
  return max + 86_400
}

function includesEthCall(
  requests: BoundaryRequest[],
  address: string,
  selector: string
): boolean {
  return requests.some((request) => {
    if (request.boundary !== 'rpc' || request.method !== 'eth_call') return false
    const call = request.params[0] as { to?: string; data?: string } | undefined
    if (!call?.to || !call.data) return false
    if (
      call.to.toLowerCase() === address.toLowerCase() &&
      call.data.slice(0, 10).toLowerCase() === selector
    ) {
      return true
    }
    try {
      const decoded = decodeFunctionData({ abi: multicall3Abi, data: call.data as Hex })
      if (decoded.functionName !== 'aggregate3') return false
      return decoded.args[0].some(
        (inner) =>
          inner.target.toLowerCase() === address.toLowerCase() &&
          inner.callData.slice(0, 10).toLowerCase() === selector
      )
    } catch {
      return false
    }
  })
}

// The list/detail data resolves in TWO react-query flush rounds under a frozen
// clock (notifyManager batches on setTimeout):
//   pump 1 — flush GetIndexDTF: indexDTFAtom hydrates, which ENABLES the
//            dependent getRebalances + proposal-list queries (gated on dtf.id);
//   (real-time yield so the dependent queries' mocked responses land)
//   pump 2 — flush getRebalances + proposal list into React so rows/detail can
//            bucket by executionBlock.
async function settleListData(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await advanceTime(page, 5_000) // pump 1 — flush GetIndexDTF
  await expect
    .poll(
      () =>
        boundaryRequests.filter(
          (request) =>
            request.boundary === 'subgraph' &&
            ['getRebalances', 'GetIndexDtfProposals'].includes(request.operationName)
        ).length
    )
    .toBeGreaterThanOrEqual(2)
  await advanceTime(page, 5_000) // pump 2 — flush rebalances + proposals
}

test('historical rebalances render from snapshot with API metrics', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const rebalances = loadRebalances()

  // Freeze past every window — all rebalances are historical.
  await freezeTime(page, idleTime())

  // Rebalance metrics come from api.reserve.org/dtf/rebalance (empty [] by
  // default in the shared api mock). Serve a real-shaped payload so the metric
  // cells render values instead of skeletons. This override constrains the exact
  // pathname while deliberately accepting every captured nonce, so
  // every nonce gets the same payload — fine for a per-row render assertion.
  overrides.api({ pathname: '/dtf/rebalance' }, [
    {
      id: 'rebalance-metrics',
      nonce: Number(rebalances[0].nonce),
      timestamp: Number(rebalances[0].timestamp),
      availableUntil: Number(rebalances[0].availableUntil),
      blockNumber: Number(rebalances[0].blockNumber),
      tokens: [],
      auctions: [],
      rebalanceAccuracy: 99.9,
      totalRebalancedUsd: 1_234_567,
      avgPriceImpactPercent: 0,
      totalPriceImpactUsd: 0,
      marketCapRebalanceImpact: 0,
    },
  ])

  await page.goto(dtfPath(dtf, 'auctions'))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  await settleListData(page, boundaryRequests)

  // One historical row per snapshot rebalance (all 5 match a proposal by
  // executionBlock), zero active rows.
  await expect(page.getByTestId('auctions-historical-item')).toHaveCount(
    rebalances.length
  )
  await expect(page.getByTestId('auctions-active-item')).toHaveCount(0)

  // Pump — flush the per-row metrics queries (they fire only after the rows
  // mounted in pump 2).
  await advanceTime(page, 5_000)

  // The overlaid metrics render in the first row: accuracy formatted from the
  // API payload (99.9%) — value assertions are data-derived, not Lingui copy.
  const firstRow = page.getByTestId('auctions-historical-item').first()
  await expect(firstRow).toContainText('99.9%')
  await expect(firstRow).toContainText('1,234,567')
})

test('an in-window rebalance renders as an active list row', async ({
  page,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const rebalances = loadRebalances()
  const latest = rebalances[0]

  // Freeze INSIDE the latest rebalance's window (restricted phase) — it buckets
  // as active while the four older rebalances stay historical.
  await freezeTime(page, rebalanceTime(latest, 'restricted'))

  await page.goto(dtfPath(dtf, 'auctions'))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  await settleListData(page, boundaryRequests)

  await expect(page.getByTestId('auctions-active-item')).toHaveCount(1)
  await expect(page.getByTestId('auctions-historical-item')).toHaveCount(
    rebalances.length - 1
  )
  // The active section no longer shows its empty state.
  await expect(
    page.getByTestId('auctions-active-section').getByTestId('auctions-empty-state')
  ).toHaveCount(0)
})

test('active rebalance detail renders from an encoded getRebalance()', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const latest = loadRebalances()[0]

  // Freeze inside the auction window so the detail resolves to the ACTIVE
  // branch (isCompleted = availableUntil < now = false).
  await freezeTime(page, rebalanceTime(latest, 'restricted'))

  // The detail's volatility hook fetches the /zapper/tokens token LIST, but the
  // shared api mock's generic /zapper branch answers it with the healthcheck
  // OBJECT -> `tokens.map` crashes the view (shared gap, see report). Serve an
  // empty list so every asset falls back to 'medium' volatility.
  overrides.api({ pathname: '/zapper/tokens' }, [])
  // Liquidity checker POSTs /rebalance/liquidity (unmocked in the shared api
  // helper — see report). Empty result: no liquidity warnings.
  overrides.api({ method: 'POST', pathname: '/rebalance/liquidity' }, {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })

  // Serve an ACTIVE getRebalance() for the DTF address — weights derived from
  // the chain-state basket (skewed so there is trading left to do), timestamps
  // and limits from the rebalance snapshot. Address-specific overrides win over
  // the shared idle `*:` entry.
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalanceShared(dtf, latest))

  await page.goto(dtfPath(dtf, `auctions/rebalance/${proposalIdFor(latest)}`))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Settles currentRebalanceAtom (rebalances × proposals); the overridden
  // getRebalance/totalSupply/totalAssets contract read flushes in the same
  // rounds and feeds the active view.
  await settleListData(page, boundaryRequests)

  // Active branch: the header renders with the matched proposal title (the
  // currentRebalanceAtom lookup by proposal id succeeded), and the completed
  // card is NOT shown.
  await expect(page.getByTestId('auctions-rebalance-header')).toBeVisible()
  await expect(page.getByTestId('auctions-rebalance-title')).toBeVisible()
  await expect(page.getByTestId('auctions-rebalance-completed')).toHaveCount(0)

  // The strongest signal the encoded tuple was DECODED and fed through
  // dtf-rebalance-lib coherently: the metrics updater ran without setting
  // rebalanceErrorAtom (incoherent weights/prices render an error banner).
  await expect(page.getByTestId('auctions-rebalance-error')).toHaveCount(0)
  await expect(page.getByTestId('auctions-round')).toHaveAttribute('data-round', '2')

  // viem may batch this no-argument read into Multicall3. Decode the outer
  // request so the assertion proves the exact live RPC source in either mode.
  expect(includesEthCall(boundaryRequests, dtf.address, '0xaa3b5568')).toBe(true)
})

test('expired rebalance detail renders the completed card', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const latest = loadRebalances()[0]

  // Freeze past the window — isCompletedAtom flips the detail to the completed
  // card (metrics degrade to skeletons under the default empty metrics API).
  await freezeTime(page, rebalanceTime(latest, 'expired'))

  // Same /zapper/tokens + /rebalance/liquidity fills as the active-detail test.
  overrides.api({ pathname: '/zapper/tokens' }, [])
  overrides.api({ method: 'POST', pathname: '/rebalance/liquidity' }, {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })

  await page.goto(dtfPath(dtf, `auctions/rebalance/${proposalIdFor(latest)}`))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Settles currentRebalanceAtom — isCompletedAtom then flips the detail to
  // the completed card.
  await settleListData(page, boundaryRequests)

  await expect(page.getByTestId('auctions-rebalance-completed')).toBeVisible()
  await expect(page.getByTestId('auctions-rebalance-header')).toHaveCount(0)
})

