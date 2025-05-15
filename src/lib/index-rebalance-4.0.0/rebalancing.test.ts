import { bn } from './numbers'
import { Auction, WeightRange, Prices } from './types'
import { getCurrentBasketDistribution } from './utils'

import { getStartRebalance } from './start-rebalance'
import { getAuctionsToOpen } from './open-auction'

const PRECISION = bn('1e3') // 1-part-in-1000 only

const assertApproxEq = (
  a: bigint,
  b: bigint,
  precision: bigint = PRECISION
) => {
  const delta = a > b ? a - b : b - a
  console.log('assertApproxEq', a, b)
  expect(a).toBeGreaterThanOrEqual(b / precision)
  expect(delta).toBeLessThanOrEqual(b / precision)
}

const assertBasketRangesEqual = (a: WeightRange, b: WeightRange) => {
  assertApproxEq(a.spot, b.spot)
  assertApproxEq(a.low, b.low)
  assertApproxEq(a.high, b.high)
}

const assertPricesEqual = (a: Prices, b: Prices) => {
  assertApproxEq(a.low, b.low)
  assertApproxEq(a.high, b.high)
}

const assertAuctionsEqual = (a: Auction[], b: Auction[]) => {
  expect(a.length).toBe(b.length)
  expect(a[0].sell).toBe(b[0].sell)
  expect(a[0].buy).toBe(b[0].buy)
  assertApproxEq(a[0].sellLimit, b[0].sellLimit)
  assertApproxEq(a[0].buyLimit, b[0].buyLimit)
  assertApproxEq(a[0].startPrice, b[0].startPrice)
  assertApproxEq(a[0].endPrice, b[0].endPrice)
}

describe('getStartRebalance() + getAuctionsToOpen()', () => {
  const supply = bn('1e21') // 1000 supply

  it('stables: [100%, 0%, 0%] -> [0%, 50%, 50%]', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimals = [bn('6'), bn('18'), bn('6')]
    const prices = [1, 1, 1]
    const priceError = [0.1, 0.1, 0.1]
    const dtfPrice = 1
    const folio = [bn('1e6'), bn('0'), bn('0')]
    const targetBasket = [bn('0'), bn('0.5e18'), bn('0.5e18')]
    const [newLimits, newPrices] = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      prices,
      priceError,
      1
    )
    expect(newLimits.length).toBe(3)
    expect(newPrices.length).toBe(3)

    assertBasketRangesEqual(newLimits[0], {
      spot: bn('0'),
      low: bn('0'),
      high: bn('0'),
    })
    assertBasketRangesEqual(newLimits[1], {
      spot: bn('0.5e27'),
      low: bn('0.45e27'),
      high: bn('0.5555e27'),
    })
    assertBasketRangesEqual(newLimits[2], {
      spot: bn('0.5e15'),
      low: bn('0.45e15'),
      high: bn('0.5555e15'),
    })

    assertPricesEqual(newPrices[0], { low: bn('0.9e21'), high: bn('1.111e21') })
    assertPricesEqual(newPrices[1], { low: bn('0.9e9'), high: bn('1.111e9') })
    assertPricesEqual(newPrices[2], { low: bn('0.9e21'), high: bn('1.111e21') })

    // getAuctionsToOpen() on no change

    const auctions = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices,
      priceError,
      dtfPrice,
      true
    )
    assertAuctionsEqual(auctions, [
      {
        sell: 'USDC',
        buy: 'DAI',
        sellLimit: bn('0'),
        buyLimit: bn('0.5e27'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[1].low,
        endPrice: (bn('1e27') * newPrices[0].low) / newPrices[1].high,
      },
      {
        sell: 'USDC',
        buy: 'USDT',
        sellLimit: bn('0'),
        buyLimit: bn('0.5e15'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[2].low,
        endPrice: (bn('1e27') * newPrices[0].low) / newPrices[2].high,
      },
    ])

    // no change after uniform price appreciation

    const prices2 = [2, 2, 2]
    const dtfPrice2 = 2
    const auctions2 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices2,
      priceError,
      dtfPrice2,
      true
    )

    assertAuctionsEqual(auctions2, [
      {
        sell: 'USDC',
        buy: 'DAI',
        sellLimit: bn('0'),
        buyLimit: bn('0.5e27'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[1].low,
        endPrice: (bn('1e27') * newPrices[0].low) / newPrices[1].high,
      },
      {
        sell: 'USDC',
        buy: 'USDT',
        sellLimit: bn('0'),
        buyLimit: bn('0.5e15'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[2].low,
        endPrice: (bn('1e27') * newPrices[0].low) / newPrices[2].high,
      },
    ])

    // loss case

    const prices3 = [0.9, 1, 1]
    const dtfPrice3 = 0.9
    const auctions3 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices3,
      priceError,
      dtfPrice3,
      true
    )

    assertAuctionsEqual(auctions3, [
      {
        sell: 'USDC',
        buy: 'DAI',
        sellLimit: bn('0'),
        buyLimit: bn('0.45e27'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[1].low, // should use original high sell price
        endPrice: (bn('1e27') * bn('0.81e21')) / newPrices[1].high, // should use new low sell price
      },
      {
        sell: 'USDC',
        buy: 'USDT',
        sellLimit: bn('0'),
        buyLimit: bn('0.45e15'),
        startPrice: (bn('1e27') * newPrices[0].high) / newPrices[2].low, // should use original high sell price
        endPrice: (bn('1e27') * bn('0.81e21')) / newPrices[2].high, // should use new low sell price
      },
    ])

    // gain case

    const prices4 = [1.1, 1, 1]
    const dtfPrice4 = 1.1
    const auctions4 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices4,
      priceError,
      dtfPrice4,
      true
    )
    assertAuctionsEqual(auctions4, [
      {
        sell: 'USDC',
        buy: 'DAI',
        sellLimit: bn('0'),
        buyLimit: bn('0.55e27'),
        startPrice: (bn('1e27') * bn('1.222e21')) / newPrices[1].low, // should use new high sell price
        endPrice: (bn('1e27') * bn('0.99e21')) / newPrices[1].high, // should use new low sell price
      },
      {
        sell: 'USDC',
        buy: 'USDT',
        sellLimit: bn('0'),
        buyLimit: bn('0.55e15'),
        startPrice: (bn('1e27') * bn('1.222e21')) / newPrices[2].low, // should use new high sell price
        endPrice: (bn('1e27') * bn('0.99e21')) / newPrices[2].high, // should use new low sell price
      },
    ])
  })
  it('stables: [0%, 50%, 50%] -> [100%, 0%, 0%]', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimals = [bn('6'), bn('18'), bn('6')]
    const prices = [1, 1, 1]
    const priceError = [0.1, 0.1, 0.1]
    const dtfPrice = 1
    const folio = [bn('0'), bn('0.5e18'), bn('0.5e6')]
    const targetBasket = [bn('1e18'), bn('0'), bn('0')]
    const [newLimits, newPrices] = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      prices,
      priceError,
      1
    )
    expect(newLimits.length).toBe(3)
    expect(newPrices.length).toBe(3)

    assertBasketRangesEqual(newLimits[0], {
      spot: bn('1e15'),
      low: bn('0.9e15'),
      high: bn('1.111e15'),
    })
    assertBasketRangesEqual(newLimits[1], {
      spot: bn('0'),
      low: bn('0'),
      high: bn('0'),
    })
    assertBasketRangesEqual(newLimits[2], {
      spot: bn('0'),
      low: bn('0'),
      high: bn('0'),
    })

    assertPricesEqual(newPrices[0], { low: bn('0.9e21'), high: bn('1.111e21') })
    assertPricesEqual(newPrices[1], { low: bn('0.9e9'), high: bn('1.111e9') })
    assertPricesEqual(newPrices[2], { low: bn('0.9e21'), high: bn('1.111e21') })

    // getAuctionsToOpen() on no change

    const auctions = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices,
      priceError,
      dtfPrice,
      true
    )
    assertAuctionsEqual(auctions, [
      {
        sell: 'DAI',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1e15'),
        startPrice: (bn('1e27') * newPrices[1].high) / newPrices[0].low,
        endPrice: (bn('1e27') * newPrices[1].low) / newPrices[0].high,
      },
      {
        sell: 'USDT',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1e15'),
        startPrice: (bn('1e27') * newPrices[2].high) / newPrices[0].low,
        endPrice: (bn('1e27') * newPrices[2].low) / newPrices[0].high,
      },
    ])

    // no change after uniform price appreciation

    const prices2 = [2, 2, 2]
    const dtfPrice2 = 2
    const auctions2 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices2,
      priceError,
      dtfPrice2,
      true
    )

    assertAuctionsEqual(auctions2, [
      {
        sell: 'DAI',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1e15'),
        startPrice: (bn('1e27') * newPrices[1].high) / newPrices[0].low,
        endPrice: (bn('1e27') * newPrices[1].low) / newPrices[0].high,
      },
      {
        sell: 'USDT',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1e15'),
        startPrice: (bn('1e27') * newPrices[2].high) / newPrices[0].low,
        endPrice: (bn('1e27') * newPrices[2].low) / newPrices[0].high,
      },
    ])

    // gain case

    const prices3 = [0.9, 1, 1]
    const dtfPrice3 = 1
    const auctions3 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices3,
      priceError,
      dtfPrice3,
      true
    )

    assertAuctionsEqual(auctions3, [
      {
        sell: 'DAI',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1.111e15'),
        startPrice: (bn('1e27') * newPrices[1].high) / bn('0.81e21'), // should use new low buy price
        endPrice: (bn('1e27') * newPrices[1].low) / bn('0.999e21'), // should use new high buy price
      },
      {
        sell: 'USDT',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('1.111e15'),
        startPrice: (bn('1e27') * newPrices[2].high) / bn('0.81e21'), // should use new low buy pricew
        endPrice: (bn('1e27') * newPrices[2].low) / bn('0.999e21'), // should use new high buy price
      },
    ])

    // loss case

    const prices4 = [1.1, 1, 1]
    const dtfPrice4 = 1
    const auctions4 = getAuctionsToOpen(
      supply,
      tokens,
      newLimits,
      newPrices,
      folio,
      decimals,
      prices4,
      priceError,
      dtfPrice4,
      true
    )
    assertAuctionsEqual(auctions4, [
      {
        sell: 'DAI',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('0.909e15'),
        startPrice: (bn('1e27') * newPrices[1].high) / newPrices[0].low, // should use original prices
        endPrice: (bn('1e27') * newPrices[1].low) / bn('1.222e21'), // should use new high buy price
      },
      {
        sell: 'USDT',
        buy: 'USDC',
        sellLimit: bn('0'),
        buyLimit: bn('0.909e15'),
        startPrice: (bn('1e27') * newPrices[2].high) / bn('1.01e21'), // should use new low buy price
        endPrice: (bn('1e27') * newPrices[2].low) / bn('1.222e21'), // should use new high buy price
      },
    ])
  })
  return
  it('volatiles: [75%, 25%]', () => {
    const tokens = ['USDC', 'ETH']
    const decimals = [bn('6'), bn('18')]
    const prices = [1, 3000]
    const priceError = [0.1, 0.1]
    const targetBasket = [bn('0.75e18'), bn('0.25e18')]
    const [newLimits, newPrices] = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      prices,
      priceError,
      1
    )
    expect(newLimits.length).toBe(2)
    expect(newPrices.length).toBe(2)

    assertBasketRangesEqual(newLimits[0], {
      spot: bn('0.75e15'),
      low: bn('0.675e15'),
      high: bn('0.833e15'),
    })
    assertBasketRangesEqual(newLimits[1], {
      spot: bn('0.833e23'),
      low: bn('0.75e23'),
      high: bn('0.926e23'),
    })

    assertPricesEqual(newPrices[0], { low: bn('0.9e21'), high: bn('1.111e21') })
    assertPricesEqual(newPrices[1], {
      low: bn('0.27e13'),
      high: bn('0.3333e13'),
    })
  })

  it('volatiles: fuzz', () => {
    // shitty fuzz test, should do a better thing later

    // 1k runs
    for (let i = 0; i < 1000; i++) {
      const tokens = ['USDC', 'DAI', 'WETH', 'WBTC']
      const decimals = [bn('6'), bn('18'), bn('18'), bn('8')]
      const bals = tokens.map((_) =>
        bn(Math.round(Math.random() * 1e36).toString())
      )
      const prices = tokens.map((_) => Math.round(Math.random() * 1e9))
      const priceError = tokens.map((_) => 0.1)
      const targetBasket = getCurrentBasketDistribution(bals, decimals, prices)

      const [newLimits, newPrices] = getStartRebalance(
        supply,
        tokens,
        decimals,
        targetBasket,
        prices,
        priceError,
        1
      )
      expect(newLimits.length).toBe(tokens.length)
      expect(newPrices.length).toBe(tokens.length)
    }
  })
})
