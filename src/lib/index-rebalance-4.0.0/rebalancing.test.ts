import { bn } from './numbers'
import {
  WeightRange,
  PriceRange,
  RebalanceLimits,
  Rebalance,
  PriceControl,
  WeightControl,
} from './types'
import { getBasketDistribution } from './utils'
import { OpenAuctionArgs, getOpenAuction } from './open-auction'
import { getStartRebalance } from './start-rebalance'

const PRECISION = bn('1e3') // 1-part-in-1000 only

const assertApproxEq = (
  a: bigint,
  b: bigint,
  precision: bigint = PRECISION
) => {
  const delta = a > b ? a - b : b - a
  // console.log('assertApproxEq', a.toString(), b.toString()) // Keep for debugging if necessary
  expect(a).toBeGreaterThanOrEqual(b / precision) // Ensure a is not far below b
  expect(delta).toBeLessThanOrEqual(b / precision) // Ensure difference is small relative to b
  // A more robust check might be delta <= max(abs(a), abs(b)) / precision, or handle b=0
  if (b !== 0n) {
    expect(delta).toBeLessThanOrEqual(
      (a > b ? a : b) / precision // Compare delta to the larger of a or b
    )
  } else {
    expect(delta).toBeLessThanOrEqual(precision) // If b is 0, delta must be small
  }
}

const assertBasketRangesEqual = (a: WeightRange, b: WeightRange) => {
  assertApproxEq(a.low, b.low)
  assertApproxEq(a.spot, b.spot)
  assertApproxEq(a.high, b.high)
}

const assertPricesEqual = (a: PriceRange, b: PriceRange) => {
  assertApproxEq(a.low, b.low)
  assertApproxEq(a.high, b.high)
}

const assertRebalanceLimitsEqual = (
  a: RebalanceLimits,
  b: RebalanceLimits,
  precision: bigint = PRECISION
) => {
  assertApproxEq(a.low, b.low, precision)
  assertApproxEq(a.spot, b.spot, precision)
  assertApproxEq(a.high, b.high, precision)
}

const assertOpenAuctionArgsEqual = (
  a: OpenAuctionArgs,
  b: OpenAuctionArgs,
  precision: bigint = PRECISION
) => {
  expect(a.rebalanceNonce).toBe(b.rebalanceNonce)
  expect(a.tokens).toEqual(b.tokens)

  expect(a.newWeights.length).toBe(b.newWeights.length)
  for (let i = 0; i < a.newWeights.length; i++) {
    assertApproxEq(a.newWeights[i], b.newWeights[i], precision)
  }

  expect(a.newPrices.length).toBe(b.newPrices.length)
  for (let i = 0; i < a.newPrices.length; i++) {
    // assertPricesEqual uses its own default precision, which is fine.
    assertPricesEqual(a.newPrices[i], b.newPrices[i])
  }

  assertRebalanceLimitsEqual(a.newLimits, b.newLimits, precision)
}

describe('NATIVE DTFs', () => {
  const supply = bn('1e21') // 1000 supply
  const auctionPriceError = [0.01, 0.01, 0.01] // Smaller price error for getOpenAuction

  it('stables: [100%, 0%, 0%] -> [0%, 50%, 50%]', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimals = [bn('6'), bn('18'), bn('6')]
    const initialMarketPrices = [1, 1, 1]
    const priceErrorStartRebalance = [0.1, 0.1, 0.1]
    const dtfPrice = 1
    const folio = [bn('1e6'), bn('0'), bn('0')] // USDC heavy
    const targetBasket = [bn('0'), bn('0.5e18'), bn('0.5e18')]

    const {
      weights: initialWeights,
      prices: initialPrices,
      limits: initialLimits,
    } = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      initialMarketPrices,
      priceErrorStartRebalance,
      dtfPrice,
      WeightControl.SOME
    )

    expect(initialWeights.length).toBe(3)
    expect(initialPrices.length).toBe(3)

    assertBasketRangesEqual(initialWeights[0], {
      low: bn('0'),
      spot: bn('0'),
      high: bn('0'),
    })
    assertBasketRangesEqual(initialWeights[1], {
      low: bn('4.5e26'),
      spot: bn('5e26'),
      high: bn('5.55556e26'), // Approximation of 0.5 / 0.9
    })
    assertBasketRangesEqual(initialWeights[2], {
      low: bn('4.5e14'),
      spot: bn('5e14'),
      high: bn('5.55556e14'), // Approximation of 0.5 / 0.9
    })

    assertPricesEqual(initialPrices[0], {
      low: bn('9e20'),
      high: bn('1.11111e21'), // Approximation of 1 / 0.9
    })
    assertPricesEqual(initialPrices[1], {
      low: bn('9e8'),
      high: bn('1.11111e9'),
    })
    assertPricesEqual(initialPrices[2], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
    assertRebalanceLimitsEqual(initialLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })

    // --- getOpenAuction() on no change ---
    let mockRebalance: Rebalance = {
      nonce: 1n,
      tokens: tokens,
      weights: initialWeights,
      initialPrices: initialPrices,
      inRebalance: tokens.map(() => true),
      limits: initialLimits,
      startedAt: 0n,
      restrictedUntil: 0n,
      availableUntil: 0n,
      priceControl: PriceControl.NONE, // For "no change" scenario, expect newPrices = initialPrices
    }

    const openAuctionArgs = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      initialMarketPrices, // Current prices
      auctionPriceError,
      0.95
    )

    assertOpenAuctionArgsEqual(openAuctionArgs, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [bn('0'), bn('5e26'), bn('5e14')], // Because eject case
      newPrices: initialPrices, // Because PriceControl.NONE
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') },
    })

    // --- no change after uniform price appreciation ---
    const prices2 = [2, 2, 2]
    // mockRebalance remains PriceControl.NONE
    const openAuctionArgs2 = getOpenAuction(
      mockRebalance, // PriceControl.NONE means newPrices will still be initialPrices
      targetBasket,
      folio,
      decimals,
      prices2, // Current prices changed
      auctionPriceError,
      0.95
    )
    // newWeights and newLimits should be robust to uniform price scaling
    // newPrices in OpenAuctionArgs will be initialPrices due to PriceControl.NONE
    assertOpenAuctionArgsEqual(openAuctionArgs2, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [bn('0'), bn('5e26'), bn('5e14')],
      newPrices: initialPrices, // Expected to be initialPrices
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') },
    })

    // --- loss case ---
    const prices3 = [0.9, 1, 1]
    mockRebalance.priceControl = PriceControl.SOME // Now allow prices to adjust

    const openAuctionArgs3 = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      prices3, // Current prices reflect loss for USDC
      auctionPriceError,
      0.95
    )

    // Expected newPrices with PriceControl.SOME and prices3
    // USDC (price 0.9, dec 6, err 0.01): low(0.9*0.99), high(0.9/0.99) -> D27 scale
    // initialPrices[0]: { low: 0.9e21, high: 1.111e21 }
    // current based: low(0.891e21), high(0.90909e21)
    // constrained: low = max(0.891e21, 0.9e21)=0.9e21. high = min(0.90909e21, 1.111e21)=0.90909e21
    const expectedNewPricesLoss: PriceRange[] = [
      {
        low: bn('9e20'),
        high: bn('9.09091e20'),
      },
      {
        // DAI (price 1, dec 18, err 0.01) -> low(0.99e9), high(1.0101e9)
        // initialPrices[1]: { low: 0.9e9, high: 1.111e9 }
        // constrained: low=max(0.99e9,0.9e9)=0.99e9, high=min(1.0101e9,1.111e9)=1.0101e9
        low: bn('9.9e8'),
        high: bn('1.01010e9'),
      },
      {
        // USDT (price 1, dec 6, err 0.01) -> low(0.99e21), high(1.0101e21)
        // initialPrices[2]: { low: 0.9e21, high: 1.111e21 }
        // constrained: low=max(0.99e21,0.9e21)=0.99e21, high=min(1.0101e21,1.111e21)=1.0101e21
        low: bn('9.9e20'),
        high: bn('1.01010e21'),
      },
    ]

    assertOpenAuctionArgsEqual(openAuctionArgs3, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        // Scaled by approx 0.9 due to USDC price drop
        bn('0'),
        bn('4.5e26'), // 0.5e27 * 0.9
        bn('4.5e14'), // 0.5e15 * 0.9
      ],
      newPrices: expectedNewPricesLoss,
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') }, // Still constrained by initialLimits
    })

    // --- gain case ---
    const prices4 = [1.1, 1, 1]
    // mockRebalance.priceControl is still PriceControl.SOME
    const openAuctionArgs4 = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      prices4, // Current prices reflect gain for USDC
      auctionPriceError,
      0.95
    )

    // Expected newPrices with PriceControl.SOME and prices4
    // USDC (price 1.1, dec 6, err 0.01): low(1.1*0.99=1.089), high(1.1/0.99=1.11111)
    // initialPrices[0]: { low: 0.9e21, high: 1.111111e21 }
    // constrained: low=max(1.089e21,0.9e21)=1.089e21. high=min(1.1111111e21,1.1111111e21)=1.1111111e21
    const expectedNewPricesGain: PriceRange[] = [
      {
        low: bn('1.089e21'),
        high: bn('1.11111e21'),
      },
      expectedNewPricesLoss[1], // DAI unchanged
      expectedNewPricesLoss[2], // USDT unchanged
    ]

    assertOpenAuctionArgsEqual(openAuctionArgs4, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        // Scaled by approx 1.1 due to USDC price rise
        bn('0'),
        bn('5.5e26'), // 0.5e27 * 1.1
        bn('5.5e14'), // 0.5e15 * 1.1
      ],
      newPrices: expectedNewPricesGain,
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') }, // Still constrained
    })
  })

  it('stables: [0%, 50%, 50%] -> [100%, 0%, 0%]', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimals = [bn('6'), bn('18'), bn('6')]
    const initialMarketPrices = [1, 1, 1]
    const priceErrorStartRebalance = [0.1, 0.1, 0.1]
    const dtfPrice = 1
    const folio = [bn('0'), bn('5e17'), bn('5e5')] // DAI, USDT heavy
    const targetBasket = [bn('1e18'), bn('0'), bn('0')] // Target 100% USDC

    const {
      weights: initialWeights,
      prices: initialPrices,
      limits: initialLimits,
    } = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      initialMarketPrices,
      priceErrorStartRebalance,
      dtfPrice,
      WeightControl.SOME
    )

    expect(initialWeights.length).toBe(3)
    expect(initialPrices.length).toBe(3)

    assertBasketRangesEqual(initialWeights[0], {
      // USDC target 100%
      low: bn('9e14'),
      spot: bn('1e15'), // 1.0 * 1e15
      high: bn('1.11111e15'),
    })
    assertBasketRangesEqual(initialWeights[1], {
      low: bn('0'),
      spot: bn('0'),
      high: bn('0'),
    })
    assertBasketRangesEqual(initialWeights[2], {
      low: bn('0'),
      spot: bn('0'),
      high: bn('0'),
    })

    // initialPrices are the same as the previous major test case
    assertPricesEqual(initialPrices[0], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
    assertPricesEqual(initialPrices[1], {
      low: bn('9e8'),
      high: bn('1.11111e9'),
    })
    assertPricesEqual(initialPrices[2], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
    assertRebalanceLimitsEqual(initialLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })

    // --- getOpenAuction() on no change ---
    let mockRebalance: Rebalance = {
      nonce: 1n,
      tokens: tokens,
      weights: initialWeights,
      initialPrices: initialPrices,
      inRebalance: tokens.map(() => true),
      limits: initialLimits,
      startedAt: 0n,
      restrictedUntil: 0n,
      availableUntil: 0n,
      priceControl: PriceControl.NONE,
    }

    const openAuctionArgs = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      initialMarketPrices,
      auctionPriceError,
      0.95
    )

    assertOpenAuctionArgsEqual(openAuctionArgs, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        bn('1e15'), // Target 100% USDC
        bn('0'),
        bn('0'),
      ],
      newPrices: initialPrices,
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') },
    })

    // --- no change after uniform price appreciation ---
    const prices2 = [2, 2, 2]
    // mockRebalance.priceControl is PriceControl.NONE
    const openAuctionArgs2 = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      prices2,
      auctionPriceError,
      0.95
    )
    assertOpenAuctionArgsEqual(openAuctionArgs2, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        // Should be stable to uniform price scaling
        bn('1e15'),
        bn('0'),
        bn('0'),
      ],
      newPrices: initialPrices, // Due to PriceControl.NONE
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') },
    })

    // --- gain case (for USDC, the asset we are buying) ---
    // Current prices: USDC price drops (0.9), making it cheaper to buy
    const prices3 = [0.9, 1, 1] // USDC price drops, good for us as we target USDC
    mockRebalance.priceControl = PriceControl.SOME

    const openAuctionArgs3 = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      prices3, // USDC is cheaper
      auctionPriceError,
      0.95
    )
    // shareValue (folio value) = 0.5*1 + 0.5*1 = 1 (DAI, USDT at price 1)
    // buValue (target value using initialWeights spot) = 1(USDC weight) * 0.9 (USDC price) = 0.9
    // idealSpotLimit = 1 / 0.9 = 1.111...
    // newLimits.spot clamped by initialLimits.high (1e18) -> 1e18
    // newWeights: actualSpotLimit = 1. shareValue=1. targetBasket[0]=1 (USDC). prices3[0]=0.9.
    // idealSpotWeight_USDC = 1 * 1 / 1 / 0.9 = 1.111...
    // idealSpotWeightD27_USDC = 1.111... * 1e15. Constrained by initialWeights[0].high (1.111...e15) -> 1.111...e15

    const expectedNewPricesGainUSDC: PriceRange[] = [
      {
        // USDC (price 0.9)
        low: bn('9e20'), // From loss case calculation for USDC
        high: bn('9.09091e20'),
      },
      {
        // DAI (price 1)
        low: bn('9.9e8'),
        high: bn('1.01010e9'),
      },
      {
        // USDT (price 1)
        low: bn('9.9e20'),
        high: bn('1.01010e21'),
      },
    ]

    assertOpenAuctionArgsEqual(openAuctionArgs3, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        bn('1.11111e15'), // Buying more USDC as it's cheaper
        bn('0'),
        bn('0'),
      ],
      newPrices: expectedNewPricesGainUSDC,
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') }, // Clamped
    })

    // --- loss case (for USDC, the asset we are buying) ---
    // Current prices: USDC price rises (1.1), making it more expensive
    const prices4 = [1.1, 1, 1] // USDC price rises
    // mockRebalance.priceControl is PriceControl.SOME
    const openAuctionArgs4 = getOpenAuction(
      mockRebalance,
      targetBasket,
      folio,
      decimals,
      prices4,
      auctionPriceError,
      0.95
    )
    // shareValue = 1.
    // buValue (target value) = 1 (USDC weight) * 1.1 (USDC price) = 1.1
    // idealSpotLimit = 1 / 1.1 = 0.9090...
    // newLimits.spot clamped by initialLimits.low (1e18) -> 1e18.
    // newWeights: actualSpotLimit = 1. shareValue=1. targetBasket[0]=1. prices4[0]=1.1.
    // idealSpotWeight_USDC = 1 * 1 / 1 / 1.1 = 0.9090...
    // idealSpotWeightD27_USDC = 0.9090... * 1e15. Constrained by initialWeights[0].low (0.9e15) -> 0.9090...e15

    const expectedNewPricesLossUSDC: PriceRange[] = [
      {
        // USDC (price 1.1)
        low: bn('1.089e21'), // From gain case calculation for USDC in previous test section
        high: bn('1.11111e21'),
      },
      expectedNewPricesGainUSDC[1], // DAI unchanged
      expectedNewPricesGainUSDC[2], // USDT unchanged
    ]
    assertOpenAuctionArgsEqual(openAuctionArgs4, {
      rebalanceNonce: 1n,
      tokens: tokens,
      newWeights: [
        bn('9.09091e14'), // Buying less USDC as it's more expensive
        bn('0'),
        bn('0'),
      ],
      newPrices: expectedNewPricesLossUSDC,
      newLimits: { low: bn('1e18'), spot: bn('1e18'), high: bn('1e18') }, // Clamped
    })
  })

  it('volatiles: [75%, 25%]', () => {
    const tokens = ['USDC', 'ETH']
    const decimals = [bn('6'), bn('18')]
    const prices = [1, 3000]
    const priceError = [0.1, 0.1]
    const targetBasket = [bn('0.75e18'), bn('0.25e18')]
    const {
      weights: newWeights,
      prices: newPricesResult, // renamed to avoid clash
      limits: newLimitsResult, // renamed
    } = getStartRebalance(
      supply,
      tokens,
      decimals,
      targetBasket,
      prices,
      priceError,
      1, // dtfPrice
      WeightControl.SOME
    )
    expect(newWeights.length).toBe(2)
    expect(newPricesResult.length).toBe(2)

    assertBasketRangesEqual(newWeights[0], {
      // USDC
      low: bn('6.75e14'),
      spot: bn('7.5e14'),
      high: bn('8.33333e14'),
    })
    assertBasketRangesEqual(newWeights[1], {
      // ETH
      low: bn('7.5e22'), // spot * 0.9
      spot: bn('8.33333e22'), // 0.25/3000 * 1e27
      high: bn('9.25926e22'), // spot / 0.9
    })

    assertPricesEqual(newPricesResult[0], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
    assertPricesEqual(newPricesResult[1], {
      low: bn('2.7e12'), // 3000 * 0.9 * 1e9
      high: bn('3.33333e12'), // (3000 / 0.9) * 1e9
    })
    assertRebalanceLimitsEqual(newLimitsResult, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })
  })

  it('volatiles: fuzz', () => {
    for (let i = 0; i < 100; i++) {
      // Reduced iterations for faster tests
      const tokensList = [
        ['USDC', 'DAI', 'WETH', 'WBTC'],
        ['SOL', 'BONK'],
      ]
      const currentTokens = tokensList[i % tokensList.length]

      const decimalsMap: { [key: string]: bigint } = {
        USDC: bn('6'),
        DAI: bn('18'),
        WETH: bn('18'),
        WBTC: bn('8'),
        SOL: bn('9'),
        BONK: bn('5'),
      }
      const currentDecimals = currentTokens.map((t) => decimalsMap[t])

      const bals = currentTokens.map(
        (_) => bn(Math.round(Math.random() * 1e20).toString()) // Reduced scale
      )
      const prices = currentTokens.map((_) =>
        Math.max(0.01, Math.random() * 1e4)
      ) // Ensure positive prices
      const priceError = currentTokens.map((_) =>
        Math.max(0.001, Math.min(0.5, Math.random() * 0.2))
      ) // Realistic price error 0.001 to 0.2

      const targetBasket = getBasketDistribution(bals, prices, currentDecimals)

      const {
        weights: newWeights,
        prices: newPricesResult,
        limits: newLimitsResult,
      } = getStartRebalance(
        supply,
        currentTokens,
        currentDecimals,
        targetBasket,
        prices,
        priceError,
        prices[0] || 1, // dtfPrice, use first token's price or 1
        WeightControl.SOME
      )
      expect(newWeights.length).toBe(currentTokens.length)
      expect(newPricesResult.length).toBe(currentTokens.length)
      expect(newLimitsResult).toBeDefined()
    }
  })
})

describe('TRACKING DTF Rebalance: USDC -> DAI/USDT Sequence', () => {
  const supply = bn('1e21') // 1000 supply
  const tokens = ['USDC', 'DAI', 'USDT']
  const decimals = [bn('6'), bn('18'), bn('6')]
  const initialMarketPrices = [1, 1, 1]
  const priceErrorStartRebalance = [0.1, 0.1, 0.1] // For getStartRebalance limits
  const dtfPrice = 1
  const targetBasketUSDCtoDAIUST = [bn('0'), bn('5e17'), bn('5e17')] // Target 0% USDC, 50% DAI, 50% USDT
  const auctionPriceErrorSmall = [0.01, 0.01, 0.01] // For getOpenAuction price calcs
  const finalStageAtForTest = 0.95 // Standard finalStageAt

  // Step 0: getStartRebalance for TRACKING DTF
  const {
    weights: initialWeightsTracking,
    prices: initialPricesTracking,
    limits: initialLimitsTracking,
  } = getStartRebalance(
    supply,
    tokens,
    decimals,
    targetBasketUSDCtoDAIUST,
    initialMarketPrices,
    priceErrorStartRebalance,
    dtfPrice,
    WeightControl.NONE
  )

  it('Step 0: Verifies initial setup from getStartRebalance (TRACKING)', () => {
    // totalPortion = (0*0.1) + (0.5*0.1) + (0.5*0.1) = 0.1
    // expectedLowLimit = (1 - 0.1) * 1e18 = 9e17
    // expectedHighLimit = (1 / (1 - 0.1)) * 1e18 = 1.11111e18
    assertRebalanceLimitsEqual(initialLimitsTracking, {
      low: bn('9e17'),
      spot: bn('1e18'),
      high: bn('1.11111e18'),
    })

    // For TRACKING, weights low/spot/high are identical
    assertBasketRangesEqual(initialWeightsTracking[0], {
      low: bn('0'),
      spot: bn('0'),
      high: bn('0'),
    }) // USDC
    assertBasketRangesEqual(initialWeightsTracking[1], {
      low: bn('5e26'),
      spot: bn('5e26'),
      high: bn('5e26'),
    }) // DAI
    assertBasketRangesEqual(initialWeightsTracking[2], {
      low: bn('5e14'),
      spot: bn('5e14'),
      high: bn('5e14'),
    }) // USDT

    // Prices are same as NATIVE calculation initially
    assertPricesEqual(initialPricesTracking[0], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
    assertPricesEqual(initialPricesTracking[1], {
      low: bn('9e8'),
      high: bn('1.11111e9'),
    })
    assertPricesEqual(initialPricesTracking[2], {
      low: bn('9e20'),
      high: bn('1.11111e21'),
    })
  })

  const mockRebalanceBase: Omit<Rebalance, 'priceControl'> = {
    nonce: 2n, // Different nonce for this suite
    tokens: tokens,
    weights: initialWeightsTracking,
    initialPrices: initialPricesTracking,
    inRebalance: tokens.map(() => true),
    limits: initialLimitsTracking,
    startedAt: 0n,
    restrictedUntil: 0n,
    availableUntil: 0n,
  }

  it('Step 1: Auction for Ejection Phase', () => {
    const _folio1 = [bn('1e6'), bn('0'), bn('0')] // 100% USDC, needs ejection
    const currentMarketPrices1 = [1, 1, 1]
    const mockRebalance1: Rebalance = {
      ...mockRebalanceBase,
      priceControl: PriceControl.SOME,
    }

    const openAuctionArgs1 = getOpenAuction(
      mockRebalance1,
      targetBasketUSDCtoDAIUST,
      _folio1,
      decimals,
      currentMarketPrices1,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )
    // Expected: buyTarget=1 (ejection). idealSpotLimit=1. limitDelta=0.
    // newLimits before clamp: {1e18,1e18,1e18}. After initialLimitsTracking clamp: {1e18,1e18,1e18}
    assertRebalanceLimitsEqual(openAuctionArgs1.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })
    // For TRACKING, newWeights from getOpenAuction are clamped to initialWeightsTracking.spot values
    expect(openAuctionArgs1.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])

    const expectedNewPrices1: PriceRange[] = [
      { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDC
      { low: bn('9.9e8'), high: bn('1.01010e9') }, // DAI
      { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDT
    ]
    assertPricesEqual(openAuctionArgs1.newPrices[0], expectedNewPrices1[0])
    assertPricesEqual(openAuctionArgs1.newPrices[1], expectedNewPrices1[1])
    assertPricesEqual(openAuctionArgs1.newPrices[2], expectedNewPrices1[2])
  })

  it('Step 2: Auction for Mid-Rebalance (progression < finalStageAt)', () => {
    // Folio: 0 USDC, 0.3 DAI (whole), 0.7 USDT (whole). shareValue = 1.
    // targetBasketDec = [0, 0.5, 0.5]. prices = [1,1,1].
    // DAI: expectedInBU = 1*0.5/1 = 0.5. actual = 0.3. balanceInBU = 0.3. value = 0.3.
    // USDT: expectedInBU = 1*0.5/1 = 0.5. actual = 0.7. balanceInBU = 0.5. value = 0.5.
    // progression = (0.3+0.5)/1 = 0.8 < 0.95. No ejection.
    const _folio2 = [bn('0'), bn('3e17'), bn('7e5')] // Corresponds to 0.3 DAI, 0.7 USDT, total value $1
    const currentMarketPrices2 = [1, 1, 1]
    const mockRebalance2: Rebalance = {
      ...mockRebalanceBase,
      priceControl: PriceControl.SOME,
    }

    const openAuctionArgs2 = getOpenAuction(
      mockRebalance2,
      targetBasketUSDCtoDAIUST,
      _folio2,
      decimals,
      currentMarketPrices2,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Expected: shareValue=1, buValue=1, idealSpotLimit=1. buyTarget=0.95 (progression 0.8 < 0.95). limitDelta=0.05.
    // newLimits pre-clamp: low=0.95e18, spot=1e18, high=1.05e18.
    // Clamped by initialLimitsTracking (9e17,1e18,1.11111e18):
    // low=max(0.95e18,9e17)=9.5e17. spot=max(min(1e18,1.11111e18),9e17)=1e18. high=min(max(1.05e18,9e17),1.11111e18)=1.05e18.
    assertRebalanceLimitsEqual(openAuctionArgs2.newLimits, {
      low: bn('9.5e17'),
      spot: bn('1e18'),
      high: bn('1.05e18'),
    })
    expect(openAuctionArgs2.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])
    // Prices same as step 1 if market prices didn't change
    assertPricesEqual(openAuctionArgs2.newPrices[0], {
      low: bn('9.9e20'),
      high: bn('1.01010e21'),
    })
    assertPricesEqual(openAuctionArgs2.newPrices[1], {
      low: bn('9.9e8'),
      high: bn('1.01010e9'),
    })
    assertPricesEqual(openAuctionArgs2.newPrices[2], {
      low: bn('9.9e20'),
      high: bn('1.01010e21'),
    })
  })

  it('Step 3: Auction for Trading to Completion (progression >= finalStageAt)', () => {
    // Folio: 0 USDC, 0.48 DAI (whole), 0.52 USDT (whole). shareValue = 1.
    // DAI: expectedInBU = 1*0.5 = 0.5. actual = 0.48. balanceInBU = 0.48. value = 0.48.
    // USDT: expectedInBU = 1*0.5 = 0.5. actual = 0.52. balanceInBU = 0.5. value = 0.5.
    // progression = (0.48+0.5)/1 = 0.98 >= 0.95. No ejection.
    const _folio3 = [bn('0'), bn('4.8e17'), bn('5.2e5')] // Corresponds to 0.48 DAI, 0.52 USDT, total value $1
    const currentMarketPrices3 = [1, 1, 1]
    const mockRebalance3: Rebalance = {
      ...mockRebalanceBase,
      priceControl: PriceControl.SOME,
    }

    const openAuctionArgs3 = getOpenAuction(
      mockRebalance3,
      targetBasketUSDCtoDAIUST,
      _folio3,
      decimals,
      currentMarketPrices3,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Expected: shareValue=1, buValue=1, idealSpotLimit=1. buyTarget=1 (progression 1 >= 0.95). limitDelta=0.
    // newLimits pre-clamp: low=1e18, spot=1e18, high=1e18.
    // Clamped by initialLimitsTracking (9e17,1e18,1.11111e18):
    // low=max(1e18,9e17)=1e18. spot=max(min(1e18,1.11111e18),9e17)=1e18. high=min(max(1e18,9e17),1.11111e18)=1e18.
    assertRebalanceLimitsEqual(openAuctionArgs3.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })
    expect(openAuctionArgs3.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])
    // Prices same as step 1 if market prices didn't change
    assertPricesEqual(openAuctionArgs3.newPrices[0], {
      low: bn('9.9e20'),
      high: bn('1.01010e21'),
    })
    assertPricesEqual(openAuctionArgs3.newPrices[1], {
      low: bn('9.9e8'),
      high: bn('1.01010e9'),
    })
    assertPricesEqual(openAuctionArgs3.newPrices[2], {
      low: bn('9.9e20'),
      high: bn('1.01010e21'),
    })
  })
})

describe('Hybrid Rebalance Scenario (Manually Constructed Rebalance Object)', () => {
  const tokens = ['USDC', 'DAI', 'USDT']
  const decimals = [bn('6'), bn('18'), bn('6')]
  const auctionPriceErrorSmall = [0.01, 0.01, 0.01]
  const finalStageAtForTest = 0.95
  const currentMarketPrices = [1, 1, 1] // For simplicity in hybrid tests
  const targetBasketHybrid = [bn('0'), bn('5e17'), bn('5e17')] // 0% USDC, 50% DAI, 50% USDT

  // Manually defined hybrid Rebalance object parts
  const hybridWeights: WeightRange[] = [
    { low: bn('0'), spot: bn('0'), high: bn('0') }, // USDC
    { low: bn('4.5e26'), spot: bn('5e26'), high: bn('5.55556e26') }, // DAI (like NATIVE)
    { low: bn('4.5e14'), spot: bn('5e14'), high: bn('5.55556e14') }, // USDT (like NATIVE)
  ]
  const hybridInitialPrices: PriceRange[] = [
    { low: bn('9e20'), high: bn('1.11111e21') }, // USDC
    { low: bn('9e8'), high: bn('1.11111e9') }, // DAI
    { low: bn('9e20'), high: bn('1.11111e21') }, // USDT
  ]
  const hybridLimits: RebalanceLimits = {
    low: bn('1'), // Widest possible reasonable low limit
    spot: bn('1e18'), // Neutral spot
    high: bn('1e36'), // Widest possible reasonable high limit
  }

  const mockRebalanceHybridBase: Omit<Rebalance, 'priceControl'> = {
    nonce: 3n, // New nonce
    tokens: tokens,
    weights: hybridWeights,
    initialPrices: hybridInitialPrices,
    inRebalance: tokens.map(() => true),
    limits: hybridLimits,
    startedAt: 0n,
    restrictedUntil: 0n,
    availableUntil: 0n,
  }

  it('Hybrid Scenario 1: Mid-Rebalance (progression < finalStageAt)', () => {
    // Folio: 0 USDC, 0.3 DAI (whole), 0.7 USDT (whole). shareValue = 1. progression = 0.8.
    const _folio = [bn('0'), bn('3e17'), bn('7e5')]
    const mockRebalanceHybrid: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: PriceControl.SOME,
    }

    const openAuctionArgs = getOpenAuction(
      mockRebalanceHybrid,
      targetBasketHybrid,
      _folio,
      decimals,
      currentMarketPrices,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Calculations for newLimits:
    // shareValue = 1, buValue (from hybridWeights.spot & prices=1) = (0*1)+(0.5*1)+(0.5*1) = 1.
    // idealSpotLimit = 1/1 = 1. buyTarget = 0.95 (progression 0.8 < 0.95).
    // limitDelta = 1 * (1 - 0.95) = 0.05.
    // preClamp newLimits: low=0.95e18, spot=1e18, high=1.05e18.
    // Clamped by wide hybridLimits (1, 1e18, 1e36) -> effectively no change from pre-clamp values.
    // finalLow = max(0.95e18, 1) = 9.5e17
    // finalSpot = max(min(1e18, 1e36), 1) = 1e18
    // finalHigh = min(max(1.05e18, 1), 1e36) = 1.05e18
    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, {
      low: bn('9.5e17'),
      spot: bn('1e18'),
      high: bn('1.05e18'),
    })

    // Calculations for newWeights:
    // actualSpotLimit = newLimits.spot / 1e18 = 1.
    // USDC: idealSpotWeight = 0. idealSpotWeightD27 = 0. Clamped by hybridWeights[0] -> 0.
    // DAI: idealSpotWeight = 1 * 0.5 / 1 / 1 = 0.5. idealSpotWeightD27 = 5e26. Clamped by hybridWeights[1] -> 5e26.
    // USDT: idealSpotWeight = 1 * 0.5 / 1 / 1 = 0.5. idealSpotWeightD27 = 5e14. Clamped by hybridWeights[2] -> 5e14.
    expect(openAuctionArgs.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])

    // Prices (assuming currentMarketPrices=[1,1,1] and auctionPriceErrorSmall=[0.01,0.01,0.01])
    // These will be current prices adjusted by error, clamped by hybridInitialPrices.
    // Example: USDC low: max(1*0.99 * 1e21, 9e20) = 9.9e20. high: min(1/0.99 * 1e21, 1.11111e21) = 1.01010e21
    const expectedHybridPrices1: PriceRange[] = [
      { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDC
      { low: bn('9.9e8'), high: bn('1.01010e9') }, // DAI
      { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDT
    ]
    assertPricesEqual(openAuctionArgs.newPrices[0], expectedHybridPrices1[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], expectedHybridPrices1[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], expectedHybridPrices1[2])
  })

  it('Hybrid Scenario 2: Near Completion (progression >= finalStageAt)', () => {
    // Folio: 0 USDC, 0.48 DAI (whole), 0.52 USDT (whole). shareValue = 1. progression = 0.98.
    const _folio = [bn('0'), bn('4.8e17'), bn('5.2e5')]
    const mockRebalanceHybrid: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: PriceControl.SOME,
    }

    const openAuctionArgs = getOpenAuction(
      mockRebalanceHybrid,
      targetBasketHybrid,
      _folio,
      decimals,
      currentMarketPrices,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Calculations for newLimits:
    // shareValue = 1, buValue = 1. idealSpotLimit = 1.
    // buyTarget = 1 (progression 0.98 >= 0.95). limitDelta = 0.
    // preClamp newLimits: low=1e18, spot=1e18, high=1e18.
    // Clamped by wide hybridLimits (1, 1e18, 1e36) -> effectively no change.
    // finalLow = max(1e18, 1) = 1e18
    // finalSpot = max(min(1e18, 1e36), 1) = 1e18
    // finalHigh = min(max(1e18, 1), 1e36) = 1e18
    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })

    // Calculations for newWeights (actualSpotLimit = 1):
    // Should still be the target weights, clamped by hybridWeights.
    expect(openAuctionArgs.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])

    // Prices expected to be the same as Hybrid Scenario 1, as market conditions are the same.
    const expectedHybridPrices2: PriceRange[] = [
      { low: bn('9.9e20'), high: bn('1.01010e21') },
      { low: bn('9.9e8'), high: bn('1.01010e9') },
      { low: bn('9.9e20'), high: bn('1.01010e21') },
    ]
    assertPricesEqual(openAuctionArgs.newPrices[0], expectedHybridPrices2[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], expectedHybridPrices2[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], expectedHybridPrices2[2])
  })

  it('Hybrid Scenario 3: Custom finalStageAt (0.8) - Round 1 (progression < thresh) & Round 2 (progression >= thresh)', () => {
    const finalStageAtCustom = 0.8
    const mockRebalanceHybridCustom: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: PriceControl.SOME,
    }

    // --- Round 1: Progression (0.7) < finalStageAtCustom - 0.01 (0.79) ---
    // Folio: 0 USDC, 0.2 DAI (whole), 0.8 USDT (whole). shareValue = 1. progression = 0.7.
    const _folioRound1 = [bn('0'), bn('2e17'), bn('8e5')] // 0.2 DAI (18dec), 0.8 USDT (6dec)

    const openAuctionArgsCustomRound1 = getOpenAuction(
      mockRebalanceHybridCustom,
      targetBasketHybrid, // Target 0 USDC, 0.5 DAI, 0.5 USDT
      _folioRound1,
      decimals,
      currentMarketPrices, // [1,1,1]
      auctionPriceErrorSmall, // [0.01,0.01,0.01]
      finalStageAtCustom // 0.8
    )

    // Expected for Round 1: buyTarget = 0.8
    // shareValue = 1, buValue = 1. idealSpotLimit = 1.
    // limitDelta = 1 * (1 - 0.8) = 0.2.
    // preClamp newLimits: low=0.8e18, spot=1e18, high=1.2e18.
    // Clamped by hybridLimits (1, 1e18, 1e36) -> no change from pre-clamp.
    assertRebalanceLimitsEqual(openAuctionArgsCustomRound1.newLimits, {
      low: bn('8e17'),
      spot: bn('1e18'),
      high: bn('1.2e18'),
    })
    // actualSpotLimit = 1. idealWeights are target. Clamped by hybridWeights.
    expect(openAuctionArgsCustomRound1.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])
    const expectedHybridPricesRound1: PriceRange[] = [
      { low: bn('9.9e20'), high: bn('1.01010e21') },
      { low: bn('9.9e8'), high: bn('1.01010e9') },
      { low: bn('9.9e20'), high: bn('1.01010e21') },
    ]
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[0],
      expectedHybridPricesRound1[0]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[1],
      expectedHybridPricesRound1[1]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[2],
      expectedHybridPricesRound1[2]
    )

    // --- Round 2: Progression (0.9) >= finalStageAtCustom - 0.01 (0.79) ---
    // Folio: 0 USDC, 0.4 DAI (whole), 0.6 USDT (whole). shareValue = 1. progression = 0.9.
    const _folioRound2 = [bn('0'), bn('4e17'), bn('6e5')]

    const openAuctionArgsCustomRound2 = getOpenAuction(
      mockRebalanceHybridCustom, // Same rebalance params
      targetBasketHybrid,
      _folioRound2,
      decimals,
      currentMarketPrices,
      auctionPriceErrorSmall,
      finalStageAtCustom // Still 0.8
    )

    // Expected for Round 2: buyTarget = 1
    // shareValue = 1, buValue = 1. idealSpotLimit = 1.
    // limitDelta = 1 * (1 - 1) = 0.
    // preClamp newLimits: low=1e18, spot=1e18, high=1e18.
    // Clamped by hybridLimits (1, 1e18, 1e36) -> no change.
    assertRebalanceLimitsEqual(openAuctionArgsCustomRound2.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })
    // actualSpotLimit = 1. idealWeights are target. Clamped by hybridWeights.
    expect(openAuctionArgsCustomRound2.newWeights).toEqual([
      bn('0'),
      bn('5e26'),
      bn('5e14'),
    ])
    // Prices expected to be the same as Round 1, as market conditions are the same.
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[0],
      expectedHybridPricesRound1[0]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[1],
      expectedHybridPricesRound1[1]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[2],
      expectedHybridPricesRound1[2]
    )
  })
})
