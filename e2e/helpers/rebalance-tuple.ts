import { encodeFunctionResult, type Hex } from 'viem'
import { loadSnapshot } from './snapshots'
import type { RegistryDTF } from './registry'

// Shared rebalance/auction fixture builders. Owned here (not in a spec) because
// both the auctions flow (active-detail render) and the launch-write spec build
// the SAME encoded getRebalance() tuple + resolve the same proposal id — the
// tuple math is a stop-condition surface (dtf-rebalance-lib coherence), so it
// lives in one reviewed place.

export interface Rebalance {
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
interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

export function loadRebalances(dtf: RegistryDTF): Rebalance[] {
  return loadSnapshot<RebalancesSnapshot>(`${dtf.snapshotDir}/rebalances.json`)
    .rebalances
}

// The list matches rebalances to proposals by executionBlock === blockNumber;
// resolve the proposal id the same way so detail routes stay snapshot-derived.
export function proposalIdFor(dtf: RegistryDTF, rebalance: Rebalance): string {
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
export function encodeActiveRebalance(
  dtf: RegistryDTF,
  rebalance: Rebalance
): Hex {
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
        low: BigInt(rebalance.rebalanceLowLimit),
        spot: BigInt(rebalance.rebalanceSpotLimit),
        high: BigInt(rebalance.rebalanceHighLimit),
      },
      { startedAt: BigInt(rebalance.timestamp), restrictedUntil, availableUntil },
      true, // bidsEnabled — active
    ],
  })
}
