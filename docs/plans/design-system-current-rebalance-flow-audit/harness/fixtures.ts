import { encodeFunctionResult, type Hex } from 'viem'
import { REGISTRY, type RegistryDTF } from '../../../../e2e/helpers/registry'
import {
  loadRebalances,
  proposalIdFor,
  type Rebalance,
} from '../../../../e2e/helpers/rebalance-tuple'
import { loadSnapshot } from '../../../../e2e/helpers/snapshots'

export { proposalIdFor }
export const lcap = REGISTRY.find((d) => d.slug === 'lcap')!
export const cmc20 = REGISTRY.find((d) => d.slug === 'cmc20')!

export type Token = { address: string; symbol: string; name: string; decimals: number }
export type RebalanceWithTokens = Rebalance & { id: string; tokens: Token[] }

interface GovernanceSnapshot {
  governances: Array<{ proposals: Array<{ executionBlock?: number | null }> }>
}
interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

export function matched(dtf: RegistryDTF): RebalanceWithTokens[] {
  const blocks = new Set(
    loadSnapshot<GovernanceSnapshot>(`${dtf.snapshotDir}/governance.json`).governances.flatMap((g) =>
      g.proposals.map((p) => String(p.executionBlock ?? ''))
    )
  )
  return (loadRebalances(dtf) as RebalanceWithTokens[]).filter((r) => blocks.has(String(r.blockNumber)))
}

// The cmc20 rebalance with a real 24h restricted window (nonce 11); every lcap
// window is zero-width.
export const windowed = (dtf: RegistryDTF) =>
  matched(dtf).find((r) => Number(r.availableUntil) - Number(r.restrictedUntil) > 3600) ?? matched(dtf)[0]

export const idleTime = (dtf: RegistryDTF) =>
  Math.max(...loadRebalances(dtf).map((r) => Number(r.availableUntil))) + 86_400

export const chainState = (dtf: RegistryDTF) =>
  loadSnapshot<ChainState>(`${dtf.snapshotDir}/chain-state.json`)

export const launchers = (dtf: RegistryDTF) =>
  loadSnapshot<{ dtf: { auctionLaunchers: string[] } }>(`${dtf.snapshotDir}/dtf.json`)

// Same tuple recipe as e2e/helpers/rebalance-tuple.ts (v5 layout, chain-state
// basket, wide prices) with the weight skew as a parameter: ±40% reproduces the
// tracked "round 2" active state; 0 makes the current basket already match the
// target, which the app reads as a finished rebalance.
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
          { name: 'weight', type: 'tuple', components: [ { name: 'low', type: 'uint256' }, { name: 'spot', type: 'uint256' }, { name: 'high', type: 'uint256' } ] },
          { name: 'price', type: 'tuple', components: [ { name: 'low', type: 'uint256' }, { name: 'high', type: 'uint256' } ] },
          { name: 'maxAuctionSize', type: 'uint256' },
          { name: 'inRebalance', type: 'bool' },
        ],
      },
      { name: 'limits', type: 'tuple', components: [ { name: 'low', type: 'uint256' }, { name: 'spot', type: 'uint256' }, { name: 'high', type: 'uint256' } ] },
      { name: 'timestamps', type: 'tuple', components: [ { name: 'startedAt', type: 'uint256' }, { name: 'restrictedUntil', type: 'uint256' }, { name: 'availableUntil', type: 'uint256' } ] },
      { name: 'bidsEnabled_', type: 'bool' },
    ],
  },
] as const

export function encodeTuple(
  dtf: RegistryDTF,
  rebalance: Rebalance,
  options: { skewPercent?: number; availableUntil?: string; restrictedUntil?: string; bidsEnabled?: boolean } = {}
): Hex {
  const state = chainState(dtf)
  const supply = BigInt(state.totalSupply)
  const skew = BigInt(options.skewPercent ?? 40)
  return encodeFunctionResult({
    abi: GET_REBALANCE_ABI,
    functionName: 'getRebalance',
    result: [
      BigInt(rebalance.nonce),
      Number(rebalance.priceControl),
      state.totalAssets.tokens.map((address, i) => {
        const balanced = (BigInt(state.totalAssets.amounts[i]) * 10n ** 27n) / supply
        const spot = (balanced * (i % 2 === 0 ? 100n + skew : 100n - skew)) / 100n
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
      {
        startedAt: BigInt(rebalance.timestamp),
        restrictedUntil: BigInt(options.restrictedUntil ?? rebalance.restrictedUntil),
        availableUntil: BigInt(options.availableUntil ?? rebalance.availableUntil),
      },
      options.bidsEnabled ?? true,
    ],
  })
}

// Deficit tokens (buy side) are the even chain-state indices under a positive
// skew, surplus (sell side) the odd ones.
export const sides = (dtf: RegistryDTF, rebalance: RebalanceWithTokens) => {
  const tokens = chainState(dtf).totalAssets.tokens.map((a) => a.toLowerCase())
  const meta = new Map(rebalance.tokens.map((t) => [t.address.toLowerCase(), t]))
  const pick = (i: number) => meta.get(tokens[i]) ?? { address: tokens[i], symbol: tokens[i].slice(0, 6), name: tokens[i], decimals: 18 }
  return {
    deficit: tokens.filter((_, i) => i % 2 === 0).map((_, j) => pick(j * 2)),
    surplus: tokens.filter((_, i) => i % 2 === 1).map((_, j) => pick(j * 2 + 1)),
    all: tokens.map((_, i) => pick(i)),
  }
}

export type SyntheticBid = {
  id: string
  bidder: string
  sellToken: Token
  buyToken: Token
  sellAmount: string
  buyAmount: string
  blockNumber: string
  timestamp: string
  transactionHash: string
}

// SYNTHETIC subgraph auction for the detail's per-rebalance auctions query.
export function liveAuction(
  rebalance: RebalanceWithTokens,
  now: number,
  options: { startOffset?: number; endOffset?: number; bids?: SyntheticBid[]; index?: number } = {}
) {
  const start = now + (options.startOffset ?? -600)
  const end = now + (options.endOffset ?? 300)
  return {
    id: `${rebalance.id}-auction-${options.index ?? 1}`,
    tokens: rebalance.tokens,
    weightLowLimit: [], weightSpotLimit: [], weightHighLimit: [],
    rebalanceLowLimit: '0', rebalanceSpotLimit: '0', rebalanceHighLimit: '0',
    priceLowLimit: [], priceHighLimit: [],
    startTime: String(start),
    endTime: String(end),
    blockNumber: String(Number(rebalance.blockNumber) + 10 * (options.index ?? 1)),
    timestamp: String(start),
    transactionHash: '0x' + 'a'.repeat(63) + String(options.index ?? 1),
    bids: options.bids ?? [],
  }
}

export function bid(
  sell: Token,
  buy: Token,
  at: number,
  index: number,
  sellWhole = 1000,
  buyWhole = 1000
): SyntheticBid {
  return {
    id: `bid-${index}`,
    bidder: '0x' + 'b'.repeat(39) + String(index),
    sellToken: sell,
    buyToken: buy,
    sellAmount: (BigInt(sellWhole) * 10n ** BigInt(sell.decimals)).toString(),
    buyAmount: (BigInt(buyWhole) * 10n ** BigInt(buy.decimals)).toString(),
    blockNumber: String(1000 + index),
    timestamp: String(at),
    transactionHash: '0x' + 'c'.repeat(63) + String(index),
  }
}

// SYNTHETIC POST /rebalance/liquidity response covering every chain-state token
// so the same static payload answers both the full probe and the Ondo probe.
export function liquidityPayload(
  tokens: Token[],
  overridesByAddress: Record<string, Partial<{ level: string; priceImpact: number; error: string; counterpart: string; ondo: Record<string, unknown> }>> = {},
  market: Record<string, unknown> | null = null
) {
  return {
    market,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: tokens.map((t, i) => {
      const o = overridesByAddress[t.address.toLowerCase()] ?? {}
      return {
        address: t.address.toLowerCase(),
        side: i % 2 === 0 ? 'buy' : 'sell',
        amountUsd: 0,
        liquidity: {
          priceImpact: o.priceImpact ?? 0.3,
          level: o.level ?? 'high',
          score: 1,
          counterpart: o.counterpart ?? 'WBNB',
          ...(o.error ? { error: o.error } : {}),
        },
        ...(o.ondo ? { ondo: o.ondo } : {}),
      }
    }),
  }
}

// Shape follows the SDK mapper (every auction needs startTime/endTime/bids).
export const metricsPayload = (r: Rebalance, accuracy: number, impact: number, traded: number, auctions = 2) => [
  {
    id: 'rebalance-metrics',
    nonce: Number(r.nonce),
    timestamp: Number(r.timestamp),
    availableUntil: Number(r.availableUntil),
    blockNumber: Number(r.blockNumber),
    tokens: [],
    auctions: Array.from({ length: auctions }, (_, i) => ({
      startTime: Number(r.timestamp) + 1_800 * i,
      endTime: Number(r.timestamp) + 1_800 * i + 1_200,
      bids: [],
      totalSellAmountUsd: traded / auctions,
      totalBuyAmountUsd: traded / auctions,
    })),
    rebalanceAccuracy: accuracy,
    totalRebalancedUsd: traded,
    rebalanceGainLossUsd: -(traded * impact) / 100,
    rebalanceGainLossPercent: -impact,
    avgPriceImpactPercent: impact,
    totalPriceImpactUsd: (traded * impact) / 100,
    marketCapRebalanceImpact: -0.42,
    trackingBasketDeviation: 100 - accuracy,
    nativeBasketDeviation: 100 - accuracy,
    isNative: false,
  },
]

type Mock = {
  api: (m: { method?: string; pathname: string }, d: unknown) => unknown
  subgraph: (m: { operationName: string; variables?: Record<string, unknown> }, d: unknown) => unknown
  ethCall: (a: string, c: string, r: Hex) => unknown
}

// The detail's standing API fills (identical to the tracked specs).
export const detailFills = (mock: Mock) => {
  mock.api({ pathname: '/zapper/tokens' }, [])
  mock.api({ method: 'POST', pathname: '/rebalance/liquidity' }, { market: null, totals: { sellUsd: 0, buyUsd: 0 }, assets: [] })
}

export const enrolLauncher = (mock: Mock, dtf: RegistryDTF, account: string) => {
  const { dtf: dtfObj } = launchers(dtf)
  mock.subgraph(
    { operationName: 'GetIndexDTF' },
    { dtf: { ...dtfObj, auctionLaunchers: [...dtfObj.auctionLaunchers, account.toLowerCase()] } }
  )
}

// cmc20 detail reads the connected wallet's BSC-USDT balance (a basket token
// the central mock does not seed) — same fill as the tracked launch spec.
export const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'
