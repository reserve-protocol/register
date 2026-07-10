import { encodeFunctionResult, type Hex } from 'viem'
import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime, rebalanceTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

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

interface Rebalance {
  nonce: string
  priceControl: string
  rebalanceLowLimit: number
  rebalanceSpotLimit: number
  rebalanceHighLimit: number
  restrictedUntil: string
  availableUntil: string
  blockNumber: string
  timestamp: string
}
interface RebalancesSnapshot {
  rebalances: Rebalance[]
}
interface GovernanceSnapshot {
  governances: Array<{
    proposals: Array<{ id: string; executionBlock?: number }>
  }>
}

function loadRebalances(): Rebalance[] {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  return loadSnapshot<RebalancesSnapshot>(`${dtf.snapshotDir}/rebalances.json`)
    .rebalances
}

// The list matches rebalances to proposals by executionBlock === blockNumber;
// resolve the proposal id the same way so detail routes stay snapshot-derived.
function proposalIdFor(rebalance: Rebalance): string {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { governances } = loadSnapshot<GovernanceSnapshot>(
    `${dtf.snapshotDir}/governance.json`
  )
  for (const gov of governances) {
    const match = gov.proposals.find(
      (p) => String(p.executionBlock ?? '') === rebalance.blockNumber
    )
    if (match) return match.id
  }
  throw new Error(`No proposal matches rebalance block ${rebalance.blockNumber}`)
}

function idleTime(): number {
  const max = Math.max(...loadRebalances().map((r) => Number(r.availableUntil)))
  return max + 86_400
}

// The list/detail data resolves in TWO react-query flush rounds under a frozen
// clock (notifyManager batches on setTimeout):
//   pump 1 — flush GetIndexDTF: indexDTFAtom hydrates, which ENABLES the
//            dependent getRebalances + proposal-list queries (gated on dtf.id);
//   (real-time yield so the dependent queries' mocked responses land)
//   pump 2 — flush getRebalances + proposal list into React so rows/detail can
//            bucket by executionBlock.
async function settleListData(page: import('@playwright/test').Page) {
  await advanceTime(page, 5_000) // pump 1 — flush GetIndexDTF
  await page.waitForTimeout(250) // dependent responses land (real time)
  await advanceTime(page, 5_000) // pump 2 — flush rebalances + proposals
}

test('historical rebalances render from snapshot with API metrics', async ({
  page,
  overrides,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const rebalances = loadRebalances()

  // Freeze past every window — all rebalances are historical.
  await freezeTime(page, idleTime())

  // Rebalance metrics come from api.reserve.org/dtf/rebalance (empty [] by
  // default in the shared api mock). Serve a real-shaped payload so the metric
  // cells render values instead of skeletons. Matched by pathname substring, so
  // every nonce gets the same payload — fine for a per-row render assertion.
  overrides.api('dtf/rebalance', [
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

  await settleListData(page)

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

test('an in-window rebalance renders as an active list row', async ({ page }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const rebalances = loadRebalances()
  const latest = rebalances[0]

  // Freeze INSIDE the latest rebalance's window (restricted phase) — it buckets
  // as active while the four older rebalances stay historical.
  await freezeTime(page, rebalanceTime(latest, 'restricted'))

  await page.goto(dtfPath(dtf, 'auctions'))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  await settleListData(page)

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
  overrides.api('zapper/tokens', [])
  // Liquidity checker POSTs /rebalance/liquidity (unmocked in the shared api
  // helper — see report). Empty result: no liquidity warnings.
  overrides.api('rebalance/liquidity', {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })

  // Serve an ACTIVE getRebalance() for the DTF address — weights derived from
  // the chain-state basket (skewed so there is trading left to do), timestamps
  // and limits from the rebalance snapshot. Address-specific overrides win over
  // the shared idle `*:` entry.
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(latest))

  await page.goto(dtfPath(dtf, `auctions/rebalance/${proposalIdFor(latest)}`))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Settles currentRebalanceAtom (rebalances × proposals); the overridden
  // getRebalance/totalSupply/totalAssets contract read flushes in the same
  // rounds and feeds the active view.
  await settleListData(page)

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
})

test('expired rebalance detail renders the completed card', async ({
  page,
  overrides,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const latest = loadRebalances()[0]

  // Freeze past the window — isCompletedAtom flips the detail to the completed
  // card (metrics degrade to skeletons under the default empty metrics API).
  await freezeTime(page, rebalanceTime(latest, 'expired'))

  // Same /zapper/tokens + /rebalance/liquidity fills as the active-detail test.
  overrides.api('zapper/tokens', [])
  overrides.api('rebalance/liquidity', {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })

  await page.goto(dtfPath(dtf, `auctions/rebalance/${proposalIdFor(latest)}`))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Settles currentRebalanceAtom — isCompletedAtom then flips the detail to
  // the completed card.
  await settleListData(page)

  await expect(page.getByTestId('auctions-rebalance-completed')).toBeVisible()
  await expect(page.getByTestId('auctions-rebalance-header')).toHaveCount(0)
})

// v5 getRebalance() output tuple, validated to encode/decode with viem:
// [nonce, priceControl, TokenRebalanceParams[], limits, timestamps, bidsEnabled].
// The shared rpc.ts idle entry uses this same shape.
const GET_REBALANCE_ABI = [
  {
    type: 'function',
    name: 'getRebalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'nonce', type: 'uint256' },
      { name: 'priceControl', type: 'uint8' },
      {
        name: 'tokens',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          {
            name: 'weight',
            type: 'tuple',
            components: [
              { name: 'low', type: 'uint256' },
              { name: 'spot', type: 'uint256' },
              { name: 'high', type: 'uint256' },
            ],
          },
          {
            name: 'price',
            type: 'tuple',
            components: [
              { name: 'low', type: 'uint256' },
              { name: 'high', type: 'uint256' },
            ],
          },
          { name: 'maxAuctionSize', type: 'uint256' },
          { name: 'inRebalance', type: 'bool' },
        ],
      },
      {
        name: 'limits',
        type: 'tuple',
        components: [
          { name: 'low', type: 'uint256' },
          { name: 'spot', type: 'uint256' },
          { name: 'high', type: 'uint256' },
        ],
      },
      {
        name: 'timestamps',
        type: 'tuple',
        components: [
          { name: 'startedAt', type: 'uint256' },
          { name: 'restrictedUntil', type: 'uint256' },
          { name: 'availableUntil', type: 'uint256' },
        ],
      },
      { name: 'bidsEnabled_', type: 'bool' },
    ],
  },
] as const

// Snapshot numbers above 2^53 lose float precision on JSON.parse, but stay
// integral — BigInt() of an integral float is exact enough for UI display.
function toBig(value: number): bigint {
  return BigInt(value)
}

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

// An ACTIVE tuple that dtf-rebalance-lib accepts as coherent:
// - tokens/balances/supply come from the chain-state snapshot (the SAME data
//   the RPC mock serves for totalAssets/totalSupply), so the lib's
//   buValue-vs-shareValue sanity check (must be within 10x) passes;
// - weight.spot is D27{tok/BU}: amount * 1e27 / supply targets the CURRENT
//   holdings, then alternating tokens are skewed ±40% so progression < 100%
//   (unskewed weights read as "Rebalance Finished");
// - price ranges are wide open — the snapshot's priceLow/HighLimit arrays are
//   NOT index-aligned with its tokens array, and a mismatched range trips the
//   lib's "spot price out of bounds" kill switch;
// - nonce/limits/timestamps come from the rebalance snapshot so the RPC state
//   agrees with the subgraph history.
function encodeActiveRebalance(rebalance: Rebalance): Hex {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const chainState = loadSnapshot<ChainState>(`${dtf.snapshotDir}/chain-state.json`)
  const supply = BigInt(chainState.totalSupply)
  const restrictedUntil = BigInt(rebalance.restrictedUntil)
  const availableUntil = BigInt(rebalance.availableUntil)

  return encodeFunctionResult({
    abi: GET_REBALANCE_ABI,
    functionName: 'getRebalance',
    result: [
      BigInt(rebalance.nonce),
      Number(rebalance.priceControl),
      chainState.totalAssets.tokens.map((address, i) => {
        const balanced = (BigInt(chainState.totalAssets.amounts[i]) * 10n ** 27n) / supply
        const spot = (balanced * (i % 2 === 0 ? 140n : 60n)) / 100n
        return {
          token: address as `0x${string}`,
          weight: { low: (spot * 90n) / 100n, spot, high: (spot * 110n) / 100n },
          price: { low: 1n, high: 10n ** 45n },
          maxAuctionSize: 10n ** 36n,
          inRebalance: true,
        }
      }),
      {
        low: toBig(rebalance.rebalanceLowLimit),
        spot: toBig(rebalance.rebalanceSpotLimit),
        high: toBig(rebalance.rebalanceHighLimit),
      },
      { startedAt: BigInt(rebalance.timestamp), restrictedUntil, availableUntil },
      true, // bidsEnabled — active
    ],
  })
}
