import { describe, expect, it } from 'vitest'
import { openAuction } from '../open-auction'
import { Auction } from '../types'

const D26 = 10n ** 26n
const D27 = 10n ** 27n

// SELL=$2/tok, BUY=$1/tok, both 18-decimals, supply = 1 whole share,
// dtfPrice = $10/share, target basket = 50/50. Hand-computed:
//   price      = 2/1 = 2            → spot/start/end = 2 * D27 = 2e27
//   wholeSell  = 0.5 * 10 / 2 / 1 = 2.5  → sellLimit = 2.5e27
//   wholeBuy   = 0.5 * 10 / 1 / 1 = 5    → buyLimit  = 5e27
const baseAuction: Auction = {
  sell: 'SELL',
  buy: 'BUY',
  sellLimit: { spot: 0n, low: 0n, high: 10n ** 30n },
  buyLimit: { spot: 0n, low: 0n, high: 10n ** 30n },
  prices: { start: 0n, end: 0n },
}

const call = (
  overrides: {
    prices?: number[]
    supply?: bigint
    initialPrices?: { start: bigint; end: bigint }
  } = {}
) =>
  openAuction(
    baseAuction,
    overrides.initialPrices ?? { start: 0n, end: 0n },
    overrides.supply ?? 10n ** 18n, // 1 whole share
    ['SELL', 'BUY'],
    [18n, 18n],
    [5n * 10n ** 17n, 5n * 10n ** 17n], // D18 target basket = [0.5, 0.5]
    overrides.prices ?? [2, 1], // USD/wholeTok
    [0, 0], // price error → start == end == spot
    10 // dtfPrice USD/wholeShare
  )

describe('openAuction (Z19 legacy v2 guards)', () => {
  it('returns the hand-computed [sellLimit, buyLimit, startPrice, endPrice] with D27 scaling', () => {
    const [sellLimit, buyLimit, startPrice, endPrice] = call()
    expect(sellLimit).toBe(25n * D26) // 2.5e27
    expect(buyLimit).toBe(5n * D27) // 5e27
    expect(startPrice).toBe(2n * D27) // 2e27
    expect(endPrice).toBe(2n * D27) // 2e27
  })

  it('clamps startPrice up to the approved initial start price', () => {
    // spotPrice = 2e27; initial start floor 2.5e27, end floor 1.5e27 (in-range).
    const [, , startPrice, endPrice] = call({
      initialPrices: { start: 25n * D26, end: 15n * D26 },
    })
    expect(startPrice).toBe(25n * D26) // clamped up to the floor
    expect(endPrice).toBe(2n * D27) // above its floor → unchanged
  })

  it('fails loud (throws) when the buy token price is 0 — never a coerced bigint', () => {
    expect(() => call({ prices: [2, 0] })).toThrow(
      'sell/buy token price unavailable'
    )
  })

  it('fails loud when the sell token price is 0', () => {
    expect(() => call({ prices: [0, 1] })).toThrow(
      'sell/buy token price unavailable'
    )
  })

  it('fails loud on a NaN price with the guard message (validated before Decimal)', () => {
    expect(() => call({ prices: [NaN, 1] })).toThrow(
      'sell/buy token price unavailable'
    )
  })

  it('fails loud on a non-finite (Infinity) price', () => {
    expect(() => call({ prices: [Infinity, 1] })).toThrow(
      'sell/buy token price unavailable'
    )
  })

  it('fails loud when supply is 0 (division by supply)', () => {
    expect(() => call({ supply: 0n })).toThrow('supply must be > 0')
  })
})
