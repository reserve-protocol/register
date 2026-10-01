import {
  FolioVersion,
  getOpenAuction,
  getTargetBasket,
  type WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import {
  folioV6Abi,
  prepareIndexDtfOpenAuction,
  prepareIndexDtfOpenAuctionArgs,
} from '@reserve-protocol/react-sdk'
import { decodeFunctionData, encodeFunctionData } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import type { Volatility } from '@/types'
import { AUCTION_PRICE_VOLATILITY } from '../atoms'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'
import { FOLIO_VERSION_V6 } from '../utils/transforms'
import {
  CMC20,
  currentAssets,
  currentPrice,
  initialPrices,
  initialWeights,
  priceMap,
  rebalance,
  supply,
  tokens,
} from './fixtures/cmc20-rebalance'

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

describe('Folio 6.0 through the same seam', () => {
  it('carries the RPC max auction length from the math into six-argument calldata', () => {
    const [legacyArgs] = legacyOpenAuction(false, false)
    const [args] = getRebalanceOpenAuction(
      FOLIO_VERSION_V6,
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
      false,
      1800n
    )
    // Same v5 math, plus the length the protocol requires on v6.
    expect({ ...args, auctionLength: undefined }).toEqual({ ...legacyArgs, auctionLength: undefined })
    expect(args.auctionLength).toBe(1800n)

    const call = prepareIndexDtfOpenAuction({ address: CMC20, chainId: 56, version: '6.0.0', args })
    const decoded = decodeFunctionData({ abi: folioV6Abi, data: call.data })
    expect(decoded.functionName).toBe('openAuction')
    expect((decoded.args as unknown as unknown[]).length).toBe(6)
    expect((decoded.args as unknown as unknown[])[5]).toBe(1800n)
  })

  it('refuses a v6 launch without an auction length instead of guessing one', () => {
    expect(() =>
      getRebalanceOpenAuction(
        FOLIO_VERSION_V6,
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
    ).toThrow(/auctionLength/)
  })
})
