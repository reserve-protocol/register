import {
  AsyncZapLeg,
  AsyncZapOrderState,
  TokenInfo,
  TokenPrice,
} from '@reserve-protocol/async-zap-sdk'
import { describe, expect, it } from 'vitest'
import { parseUnits } from 'viem'
import { Token } from '@/types'
import { calculatePriceImpact } from '../hooks/use-price-impact'

const token = (
  address: `0x${string}`,
  symbol: string,
  decimals: number
): TokenInfo => ({
  address,
  symbol,
  name: symbol,
  decimals,
})

const usdc = token('0x0000000000000000000000000000000000000001', 'USDC', 6)
const weth = token('0x0000000000000000000000000000000000000002', 'WETH', 18)
const wbtc = token('0x0000000000000000000000000000000000000003', 'WBTC', 8)

const quoteToken = usdc as Token

const prices: TokenPrice[] = [
  { address: usdc.address, price: 1, timestamp: 1 },
  { address: weth.address, price: 3000, timestamp: 1 },
  { address: wbtc.address, price: 60000, timestamp: 1 },
]

const leg = ({
  id,
  side,
  asset,
  assetAmount,
  quoteTokenAmount,
}: {
  id: string
  side: 'buy' | 'sell'
  asset: TokenInfo
  assetAmount: bigint
  quoteTokenAmount: bigint
}) =>
  ({
    id,
    side,
    asset,
    quoteToken,
    assetAmount,
    quoteTokenAmount,
  }) as AsyncZapLeg

const fulfilledOrder = (
  legId: string,
  executedSellAmount: bigint,
  executedBuyAmount: bigint
) =>
  ({
    legId,
    phase: 'fulfilled',
    cowOrder: {
      executedSellAmount: executedSellAmount.toString(),
      executedBuyAmount: executedBuyAmount.toString(),
    },
  }) as AsyncZapOrderState

describe('calculatePriceImpact', () => {
  it('calculates signed impacts for buy and sell legs', () => {
    const sellLeg = leg({
      id: 'sell-weth',
      side: 'sell',
      asset: weth,
      assetAmount: parseUnits('1', 18),
      quoteTokenAmount: parseUnits('3300', 6),
    })
    const buyLeg = leg({
      id: 'buy-wbtc',
      side: 'buy',
      asset: wbtc,
      assetAmount: parseUnits('0.1', 8),
      quoteTokenAmount: parseUnits('6300', 6),
    })

    const result = calculatePriceImpact({
      legs: [sellLeg, buyLeg],
      quoteToken,
      prices,
    })

    expect(result.byLeg['sell-weth']).toBeCloseTo(0.1)
    expect(result.byLeg['buy-wbtc']).toBeCloseTo(-0.05)
    expect(result.aggregate).toBeCloseTo(0)
    expect(result.actualAggregate).toBeUndefined()
  })

  it('omits legs with missing prices or zero amounts', () => {
    const result = calculatePriceImpact({
      legs: [
        leg({
          id: 'missing-price',
          side: 'sell',
          asset: token(
            '0x0000000000000000000000000000000000000004',
            'MISSING',
            18
          ),
          assetAmount: parseUnits('1', 18),
          quoteTokenAmount: parseUnits('1', 6),
        }),
        leg({
          id: 'zero-amount',
          side: 'sell',
          asset: weth,
          assetAmount: 0n,
          quoteTokenAmount: parseUnits('1', 6),
        }),
      ],
      quoteToken,
      prices,
    })

    expect(result.byLeg['missing-price']).toBeUndefined()
    expect(result.byLeg['zero-amount']).toBeUndefined()
    expect(result.aggregate).toBeUndefined()
  })

  it('uses fulfilled order amounts for actual aggregate impact', () => {
    const sellLeg = leg({
      id: 'sell-weth',
      side: 'sell',
      asset: weth,
      assetAmount: parseUnits('1', 18),
      quoteTokenAmount: parseUnits('3000', 6),
    })

    const result = calculatePriceImpact({
      legs: [sellLeg],
      quoteToken,
      prices,
      ordersByLegId: {
        [sellLeg.id]: fulfilledOrder(
          sellLeg.id,
          parseUnits('1', 18),
          parseUnits('3150', 6)
        ),
      },
    })

    expect(result.byLeg['sell-weth']).toBe(0)
    expect(result.aggregate).toBe(0)
    expect(result.actualAggregate).toBeCloseTo(0.05)
  })

  it('ignores unfulfilled actual orders', () => {
    const sellLeg = leg({
      id: 'sell-weth',
      side: 'sell',
      asset: weth,
      assetAmount: parseUnits('1', 18),
      quoteTokenAmount: parseUnits('3000', 6),
    })

    const result = calculatePriceImpact({
      legs: [sellLeg],
      quoteToken,
      prices,
      ordersByLegId: {
        [sellLeg.id]: {
          ...fulfilledOrder(
            sellLeg.id,
            parseUnits('1', 18),
            parseUnits('3150', 6)
          ),
          phase: 'waiting',
        } as AsyncZapOrderState,
      },
    })

    expect(result.actualAggregate).toBeUndefined()
  })

  it('yields no impact when the quote-token price is missing — never a fabricated $1', () => {
    const sellLeg = leg({
      id: 'sell-weth',
      side: 'sell',
      asset: weth,
      assetAmount: parseUnits('1', 18),
      quoteTokenAmount: parseUnits('3300', 6),
    })

    // Prices resolve for the legs' assets but NOT for the quote token. The old
    // `?? 1` fabricated a $1 quote price, reporting ~-100% impact on real legs.
    const result = calculatePriceImpact({
      legs: [sellLeg],
      quoteToken,
      prices: prices.filter((p) => p.address !== usdc.address),
      ordersByLegId: {
        [sellLeg.id]: fulfilledOrder(
          sellLeg.id,
          parseUnits('1', 18),
          parseUnits('3150', 6)
        ),
      },
    })

    expect(result.byLeg[sellLeg.id]).toBeUndefined()
    expect(result.aggregate).toBeUndefined()
    expect(result.actualAggregate).toBeUndefined()
  })
})
