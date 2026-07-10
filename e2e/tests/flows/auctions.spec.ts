import { encodeFunctionResult, type Hex } from 'viem'
import { expect, test } from '../../fixtures/base'
import { freezeTime, rebalanceTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Rebalance / auctions flows on base/lcap.
//
// LIVE rebalance/auction state comes from RPC getRebalance() (selector
// 0xaa3b5568), NOT the subgraph — the subgraph (getRebalances) is history only.
// The default rpc mock answers unknown calls with zeros → the deterministic
// "no active rebalance" state.
//
// BLOCKED (see report — shared snapshot gap): the rebalance list and detail both
// derive from `indexDTFAtom`, which the SDK's `sdk.index.get` (GetIndexDTF)
// feeds. The committed `dtf.json` snapshot is the SDK-PROCESSED shape; the SDK
// re-parses it as a raw goldsky response and throws at
// `mapPriceControl(undefined)`, so `indexDTFAtom` never hydrates. Consequences:
//   - getRebalances (gated on dtf.id) never fires → no historical/active rows.
//   - use-rebalance-current-data getRebalance() read (gated on dtf.id) never
//     fires → the active-detail state can't be exercised.
// These tests therefore assert the offline SHELL that renders regardless (route
// mounts, list/detail containers present). The richer behavioral assertions —
// historical rows, active-list row via rebalanceTime(r,'restricted'), completed
// detail metrics, and the active-detail getRebalance() encode below — are ready
// to enable the moment the shared snapshot is re-captured in raw shape.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

interface Rebalance {
  restrictedUntil: string
  availableUntil: string
  blockNumber: string
  nonce: string
}
interface RebalancesSnapshot {
  rebalances: Rebalance[]
}

function loadRebalances(): Rebalance[] {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  return loadSnapshot<RebalancesSnapshot>(`${dtf.snapshotDir}/rebalances.json`)
    .rebalances
}

function idleTime(): number {
  const max = Math.max(...loadRebalances().map((r) => Number(r.availableUntil)))
  return max + 86_400
}

test('auctions list route renders its shell offline', async ({ page, overrides }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!

  // Pin the idle (all-historical) window; harmless for the shell, correct once
  // rows render.
  await freezeTime(page, idleTime())
  overrides.api('dtf/rebalance', []) // metrics endpoint, empty (see report)

  await page.goto(dtfPath(dtf, 'auctions'))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Pump — flush react-query notifyManager (frozen clock batches state on a
  // setTimeout that never fires until time advances).
  await page.clock.runFor(5_000)

  await expect(page.getByTestId('auctions-rebalance-list')).toBeVisible()
  await expect(page.getByTestId('auctions-active-section')).toBeVisible()
  await expect(page.getByTestId('auctions-historical-section')).toBeVisible()
})

test('rebalance detail route renders its shell offline', async ({ page, overrides }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const rebalance = loadRebalances()[0]

  // Freeze inside the (restricted) auction window so, once unblocked, the detail
  // resolves to the ACTIVE (not completed) branch. rebalanceTime(r,'restricted')
  // = restrictedUntil-60; these snapshots are captured with a zero-width window
  // (restrictedUntil == availableUntil), so 'restricted' is the only phase that
  // lands < availableUntil (active).
  await freezeTime(page, rebalanceTime(rebalance, 'restricted'))
  overrides.api('dtf/rebalance', [])

  // Ready-to-use active-rebalance getRebalance() encode. Served on the DTF
  // address at selector 0xaa3b5568; the RPC mock's Multicall3 handler consults
  // overrides.ethCall before its zero fallback. Currently inert because the read
  // is gated on indexDTFAtom (blocked) — kept here so the active-detail assertion
  // works verbatim once hydration lands.
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(rebalance))

  await page.goto(dtfPath(dtf, `auctions/rebalance/${syntheticProposalId()}`))
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  // Pump — flush react-query / receipt-free reads under the frozen clock.
  await page.clock.runFor(5_000)

  // The detail renders its active shell (header container) regardless of whether
  // currentRebalance has resolved — RebalanceContent mounts RebalanceHeader
  // unconditionally on the non-completed branch.
  await expect(page.getByTestId('auctions-rebalance-header')).toBeVisible()
})

// A proposalId for the detail route. Any id works for the shell; once unblocked,
// use a real proposal id whose executionBlock matches a rebalance blockNumber.
function syntheticProposalId(): string {
  return '1'
}

// v5 getRebalance() output tuple, validated to encode/decode with viem:
// [nonce, priceControl, TokenRebalanceParams[], limits, timestamps, bidsEnabled].
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

function encodeActiveRebalance(rebalance: Rebalance): Hex {
  const restrictedUntil = BigInt(rebalance.restrictedUntil)
  const availableUntil = BigInt(rebalance.availableUntil)
  return encodeFunctionResult({
    abi: GET_REBALANCE_ABI,
    functionName: 'getRebalance',
    result: [
      BigInt(rebalance.nonce),
      0, // priceControl
      [
        {
          token: '0x0000000000000000000000000000000000000001',
          weight: { low: 1n, spot: 2n, high: 3n },
          price: { low: 1n, high: 2n },
          maxAuctionSize: 10n ** 18n,
          inRebalance: true,
        },
      ],
      { low: 1n, spot: 1n, high: 1n },
      { startedAt: restrictedUntil - 3600n, restrictedUntil, availableUntil },
      true, // bidsEnabled — active
    ],
  })
}
