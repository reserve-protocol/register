import { Token } from '@/types'
import { WeightRange } from '@reserve-protocol/dtf-rebalance-lib'
import { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import getRebalanceOpenAuction, {
  buildOpenAuctionArrays,
  buildRebalanceOpenAuctionArrays,
  PriceUnavailableError,
} from '../utils/get-rebalance-open-auction'

const A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

const token = (address: string, decimals = 18): Token => ({
  address: address as Address,
  symbol: address.slice(2, 5).toUpperCase(),
  name: address,
  decimals,
})

const weight: WeightRange = { low: 1n, spot: 2n, high: 3n }

const baseArgs = (
  overrides: {
    currentA?: number
    currentB?: number
    snapshotA?: number
    snapshotB?: number
    useCurrentPricesForTarget?: boolean
    omitBFromPrices?: boolean
  } = {}
) => {
  const {
    currentA = 100,
    currentB = 200,
    snapshotA = 90,
    snapshotB = 210,
    useCurrentPricesForTarget = true,
    omitBFromPrices = false,
  } = overrides

  const prices: Record<string, { currentPrice: number; snapshotPrice: number }> =
    {
      [A]: { currentPrice: currentA, snapshotPrice: snapshotA },
    }
  if (!omitBFromPrices) {
    prices[B] = { currentPrice: currentB, snapshotPrice: snapshotB }
  }

  return [
    [A, B],
    { [A]: token(A, 18), [B]: token(B, 6) },
    { [A]: snapshotA, [B]: snapshotB },
    { [A]: weight, [B]: weight },
    { [A]: 10n, [B]: 20n },
    { [A]: 11n, [B]: 22n },
    prices,
    { [A]: 'medium', [B]: 'high' },
    useCurrentPricesForTarget,
  ] as Parameters<typeof buildOpenAuctionArrays>
}

describe('buildOpenAuctionArrays (Z26 price validation)', () => {
  it('builds arrays in rebalanceTokens order when every price is > 0', () => {
    const result = buildOpenAuctionArrays(...baseArgs())
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Ordered A then B (18 then 6 decimals), prices/assets aligned.
    expect(result.arrays.decimals).toEqual([18n, 6n])
    expect(result.arrays.currentPrices).toEqual([100, 200])
    expect(result.arrays.targetBasketPrices).toEqual([100, 200]) // tracking → current
    expect(result.arrays.initialFolioAssets).toEqual([10n, 20n])
    expect(result.arrays.currentFolioAssets).toEqual([11n, 22n])
    expect(result.arrays.priceError).toEqual([0.05, 0.1]) // medium, high
    expect(result.arrays.weights).toEqual([weight, weight])
  })

  it('is indeterminate (not a finite weight) when token B currentPrice is 0', () => {
    const result = buildOpenAuctionArrays(...baseArgs({ currentB: 0 }))
    expect(result).toEqual({
      ok: false,
      reason: 'price-unavailable',
      token: B,
    })
  })

  it('is indeterminate when token B is missing from the price map (API omit)', () => {
    const result = buildOpenAuctionArrays(...baseArgs({ omitBFromPrices: true }))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.token).toBe(B)
  })

  it('is indeterminate on a non-finite (NaN) price', () => {
    const result = buildOpenAuctionArrays(...baseArgs({ currentB: NaN }))
    expect(result.ok).toBe(false)
  })

  it('validates the snapshot price when the target basket uses snapshots (non-tracking)', () => {
    const result = buildOpenAuctionArrays(
      ...baseArgs({ useCurrentPricesForTarget: false, snapshotB: 0 })
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.token).toBe(B)
  })

  it('ignores a 0 snapshot price when tracking (snapshot not consumed)', () => {
    // currentPrices feed both getOpenAuction and the target basket → a stale 0
    // snapshot must not block a launch whose math never reads it.
    const result = buildOpenAuctionArrays(
      ...baseArgs({ useCurrentPricesForTarget: true, snapshotB: 0 })
    )
    expect(result.ok).toBe(true)
  })
})

describe('getRebalanceOpenAuction (Z26 fail-loud wrapper)', () => {
  const v5Rebalance = {
    tokens: [{ token: A }, { token: B }],
  } as any

  const callArgs = (currentB: number) =>
    [
      5 as any, // FolioVersion V5
      [token(A, 18), token(B, 6)],
      v5Rebalance,
      1000n, // supply
      1000n, // initialSupply
      { [A]: 11n, [B]: 22n }, // currentAssets
      { [A]: 10n, [B]: 20n }, // initialAssets
      { [A]: 90, [B]: 210 }, // initialPrices
      { [A]: weight, [B]: weight }, // initialWeights
      {
        [A]: { currentPrice: 100, snapshotPrice: 90 },
        [B]: { currentPrice: currentB, snapshotPrice: 210 },
      }, // prices
      true, // isTrackingDTF
      { [A]: 'medium', [B]: 'medium' }, // volatility
      90,
      false,
    ] as Parameters<typeof getRebalanceOpenAuction>

  it('throws PriceUnavailableError (never a coerced arg) when a price is 0', () => {
    expect(() => getRebalanceOpenAuction(...callArgs(0))).toThrow(
      PriceUnavailableError
    )
    try {
      getRebalanceOpenAuction(...callArgs(0))
    } catch (e) {
      expect(e).toBeInstanceOf(PriceUnavailableError)
      expect((e as PriceUnavailableError).token).toBe(B)
    }
  })

  it('buildRebalanceOpenAuctionArrays orders tokens via the v5 rebalance shape', () => {
    const result = buildRebalanceOpenAuctionArrays(
      5 as any,
      [token(A, 18), token(B, 6)],
      v5Rebalance,
      { [A]: 11n, [B]: 22n },
      { [A]: 10n, [B]: 20n },
      { [A]: 90, [B]: 210 },
      { [A]: weight, [B]: weight },
      {
        [A]: { currentPrice: 100, snapshotPrice: 90 },
        [B]: { currentPrice: 200, snapshotPrice: 210 },
      },
      { [A]: 'medium', [B]: 'medium' },
      true,
      false
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.arrays.currentPrices).toEqual([100, 200])
    expect(result.arrays.decimals).toEqual([18n, 6n])
  })

  it('fails closed when a rebalance token is missing from the token map', () => {
    // Subgraph lag / version shape mismatch: the on-chain rebalance lists a
    // token the token list doesn't know. Pre-guard this was a render TypeError.
    const args = baseArgs()
    args[1] = { [A]: token(A, 18) } // drop B's metadata, prices stay valid

    const result = buildOpenAuctionArrays(...args)

    expect(result).toEqual({
      ok: false,
      reason: 'token-metadata-missing',
      token: B,
    })
  })
})
