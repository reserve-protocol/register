import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  FolioVersion,
  getOpenAuction,
  getTargetBasket,
  PriceControl,
  type WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import type { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import {
  prepareIndexDtfOpenAuction,
  prepareIndexDtfOpenAuctionArgs,
} from '@reserve-protocol/react-sdk'
import { encodeFunctionData } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import type { Token, Volatility } from '@/types'
import { AUCTION_PRICE_VOLATILITY } from '../atoms'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

// S3b oracle: the same captured CMC20 (BSC, v5) inputs through a frozen copy of
// the pre-migration Register calculation and through the SDK must produce
// byte-equal openAuction args and calldata, in every target-price mode.

const sdkCalls = vi.hoisted(() => ({ prepareArgs: 0 }))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...actual,
    prepareIndexDtfOpenAuctionArgs: (
      ...params: Parameters<typeof actual.prepareIndexDtfOpenAuctionArgs>
    ) => {
      sdkCalls.prepareArgs += 1
      return actual.prepareIndexDtfOpenAuctionArgs(...params)
    },
  }
})

const snapshot = <T,>(file: string): T =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), `e2e/snapshots/bsc/cmc20/${file}`), 'utf8')
  ).data as T

const CMC20 = '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867' as const
const chainState = snapshot<{
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
  basketTokens: Token[]
}>('chain-state.json')
const prices = snapshot<{ address: string; price: number }[]>('token-prices.json')
const [latestRebalance] = snapshot<{
  rebalances: {
    nonce: string
    rebalanceLowLimit: string
    rebalanceSpotLimit: string
    rebalanceHighLimit: string
    restrictedUntil: string
    availableUntil: string
    timestamp: string
  }[]
}>('rebalances.json').rebalances

const supply = BigInt(chainState.totalSupply)
const tokens: Token[] = chainState.basketTokens.map((t) => ({
  ...t,
  address: t.address.toLowerCase() as Token['address'],
}))
const currentAssets = Object.fromEntries(
  chainState.totalAssets.tokens.map((address, i) => [
    address.toLowerCase(),
    BigInt(chainState.totalAssets.amounts[i]),
  ])
)
// Same skew the e2e fixture applies: alternate ±40% so the auction has work to do.
const rebalance: RebalanceV5 = {
  nonce: BigInt(latestRebalance.nonce),
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
    low: BigInt(latestRebalance.rebalanceLowLimit),
    spot: BigInt(latestRebalance.rebalanceSpotLimit),
    high: BigInt(latestRebalance.rebalanceHighLimit),
  },
  timestamps: {
    startedAt: BigInt(latestRebalance.timestamp),
    restrictedUntil: BigInt(latestRebalance.restrictedUntil),
    availableUntil: BigInt(latestRebalance.availableUntil),
  },
}
const initialWeights: Record<string, WeightRange> = Object.fromEntries(
  rebalance.tokens.map((t) => [t.token, t.weight])
)
const currentPrice = Object.fromEntries(
  prices.map((p) => [p.address.toLowerCase(), p.price])
)
// Snapshot prices deliberately differ from current so the mode choice is observable.
const initialPrices: Record<string, number> = Object.fromEntries(
  Object.entries(currentPrice).map(([k, v]) => [k, v * 0.97])
)
const priceMap = Object.fromEntries(
  Object.entries(currentPrice).map(([k, v]) => [
    k,
    { currentPrice: v, snapshotPrice: initialPrices[k] },
  ])
)
// One token without a volatility entry: Register defaults it to 'medium'.
const tokenPriceVolatility: Record<string, Volatility> = {
  [tokens[0].address]: 'low',
  [tokens[1].address]: 'high',
  [tokens[2].address]: 'degen',
}
const REBALANCE_PERCENT = 98

// Frozen pre-migration Register calculation (independent of the SDK).
function legacyOpenAuction(isTrackingDTF: boolean, isHybridDTF: boolean) {
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const targetBasketPrices: number[] = []
  const priceError: number[] = []
  const initialFolioAssets: bigint[] = []
  const currentFolioAssets: bigint[] = []
  const weights: WeightRange[] = []
  const useCurrent = isTrackingDTF || isHybridDTF
  for (const t of rebalance.tokens) {
    const meta = tokens.find((x) => x.address === t.token)!
    decimals.push(BigInt(meta.decimals))
    currentPrices.push(currentPrice[t.token])
    targetBasketPrices.push(useCurrent ? currentPrice[t.token] : initialPrices[t.token])
    priceError.push(AUCTION_PRICE_VOLATILITY[tokenPriceVolatility[t.token] || 'medium'])
    initialFolioAssets.push(currentAssets[t.token] || 0n)
    currentFolioAssets.push(currentAssets[t.token] || 0n)
    weights.push(initialWeights[t.token])
  }
  const targetBasket = getTargetBasket(weights, targetBasketPrices, decimals)
  return getOpenAuction(
    FolioVersion.V5,
    rebalance,
    supply,
    supply,
    initialFolioAssets,
    targetBasket,
    currentFolioAssets,
    decimals,
    currentPrices,
    priceError,
    REBALANCE_PERCENT / 100
  )
}

const modes = [
  { name: 'native (snapshot prices)', isTrackingDTF: false, isHybridDTF: false },
  { name: 'tracking (current prices)', isTrackingDTF: true, isHybridDTF: false },
  { name: 'hybrid (current prices)', isTrackingDTF: false, isHybridDTF: true },
]

describe('openAuction parity: legacy Register calculation vs SDK', () => {
  it.each(modes)('$name: byte-equal args, metrics and calldata', ({ isTrackingDTF, isHybridDTF }) => {
    const [legacyArgs, legacyMetrics] = legacyOpenAuction(isTrackingDTF, isHybridDTF)
    const sdk = prepareIndexDtfOpenAuctionArgs({
      version: '5.0.0',
      rebalance: { ...rebalance, bidsEnabled: true },
      tokens,
      supply,
      initialSupply: supply,
      currentAssets,
      initialAssets: currentAssets,
      initialPrices,
      initialWeights,
      prices: priceMap,
      tokenPriceVolatility: Object.fromEntries(
        rebalance.tokens.map((t) => [
          t.token,
          AUCTION_PRICE_VOLATILITY[tokenPriceVolatility[t.token] || 'medium'],
        ])
      ),
      rebalancePercent: REBALANCE_PERCENT,
      isTrackingDtf: isTrackingDTF,
      isHybridDtf: isHybridDTF,
    })

    expect(legacyArgs.tokens.length).toBe(18)
    expect(sdk.args).toEqual(legacyArgs)
    expect(sdk.metrics).toEqual(legacyMetrics)

    const sdkCall = prepareIndexDtfOpenAuction({
      address: CMC20,
      chainId: 56,
      version: '5.0.0',
      args: sdk.args,
    })
    const legacyCalldata = encodeFunctionData({
      abi: dtfIndexAbi,
      functionName: 'openAuction',
      args: [
        legacyArgs.rebalanceNonce,
        legacyArgs.tokens as `0x${string}`[],
        legacyArgs.newWeights,
        legacyArgs.newPrices,
        legacyArgs.newLimits,
      ],
    })
    expect(sdkCall.data).toBe(legacyCalldata)
  })

  it('the snapshot and current modes are actually different vectors', () => {
    const [native] = legacyOpenAuction(false, false)
    const [tracking] = legacyOpenAuction(true, false)
    expect(native.newWeights).not.toEqual(tracking.newWeights)
  })
})

describe('production seam: getRebalanceOpenAuction delegates to the SDK', () => {
  it('produces the legacy result through prepareIndexDtfOpenAuctionArgs', () => {
    sdkCalls.prepareArgs = 0
    const [legacyArgs] = legacyOpenAuction(false, false)
    const [args] = getRebalanceOpenAuction(
      FolioVersion.V5,
      tokens,
      rebalance,
      supply,
      supply,
      currentAssets,
      currentAssets,
      initialPrices,
      initialWeights,
      priceMap,
      false,
      tokenPriceVolatility,
      REBALANCE_PERCENT,
      false
    )
    expect(args).toEqual(legacyArgs)
    // Bypassing the SDK at this seam must fail here, not only in review.
    expect(sdkCalls.prepareArgs).toBe(1)
  })
})
