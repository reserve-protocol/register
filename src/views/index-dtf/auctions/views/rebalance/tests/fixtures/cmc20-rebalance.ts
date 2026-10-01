import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  PriceControl,
  type WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import type { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import type { Token, Volatility } from '@/types'

// Captured CMC20 (BSC) inputs, skewed ±40% like the e2e active-rebalance tuple so the auction has work to do.
const snapshot = <T,>(file: string): T =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), `e2e/snapshots/bsc/cmc20/${file}`), 'utf8')
  ).data as T

export const CMC20 = '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867' as const

const chainState = snapshot<{
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
  basketTokens: Token[]
}>('chain-state.json')
const prices = snapshot<{ address: string; price: number }[]>('token-prices.json')
export const [capturedRebalance] = snapshot<{
  rebalances: {
    id: string
    nonce: string
    blockNumber: string
    rebalanceLowLimit: string
    rebalanceSpotLimit: string
    rebalanceHighLimit: string
    restrictedUntil: string
    availableUntil: string
    timestamp: string
  }[]
}>('rebalances.json').rebalances

export const supply = BigInt(chainState.totalSupply)
export const tokens: Token[] = chainState.basketTokens.map((t) => ({
  ...t,
  address: t.address.toLowerCase() as Token['address'],
}))
export const currentAssets = Object.fromEntries(
  chainState.totalAssets.tokens.map((address, i) => [
    address.toLowerCase(),
    BigInt(chainState.totalAssets.amounts[i]),
  ])
)
export const rebalance: RebalanceV5 = {
  nonce: BigInt(capturedRebalance.nonce),
  priceControl: PriceControl.PARTIAL,
  tokens: chainState.totalAssets.tokens.map((address, i) => {
    const balanced = (BigInt(chainState.totalAssets.amounts[i]) * 10n ** 27n) / supply
    const spot = (balanced * (i % 2 === 0 ? 140n : 60n)) / 100n
    return {
      token: address.toLowerCase(),
      weight: { low: (spot * 90n) / 100n, spot, high: (spot * 110n) / 100n },
      price: { low: 1n, high: 10n ** 45n },
      maxAuctionSize: 10n ** 36n,
      inRebalance: true,
    }
  }),
  limits: {
    low: BigInt(capturedRebalance.rebalanceLowLimit),
    spot: BigInt(capturedRebalance.rebalanceSpotLimit),
    high: BigInt(capturedRebalance.rebalanceHighLimit),
  },
  timestamps: {
    startedAt: BigInt(capturedRebalance.timestamp),
    restrictedUntil: BigInt(capturedRebalance.restrictedUntil),
    availableUntil: BigInt(capturedRebalance.availableUntil),
  },
}
export const initialWeights: Record<string, WeightRange> = Object.fromEntries(
  rebalance.tokens.map((t) => [t.token, t.weight])
)
export const currentPrice: Record<string, number> = Object.fromEntries(
  prices.map((p) => [p.address.toLowerCase(), p.price])
)
// Snapshot prices deliberately differ from current so a target-price mode choice is observable.
export const initialPrices: Record<string, number> = Object.fromEntries(
  Object.entries(currentPrice).map(([k, v]) => [k, v * 0.97])
)
export const priceMap = Object.fromEntries(
  Object.entries(currentPrice).map(([k, v]) => [
    k,
    { currentPrice: v, snapshotPrice: initialPrices[k] },
  ])
)
export const tokenPriceVolatility: Record<string, Volatility> = {}
