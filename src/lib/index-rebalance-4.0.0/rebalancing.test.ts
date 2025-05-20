import { bn } from './numbers'
import { WeightRange, PriceRange, RebalanceLimits, Rebalance } from './types'
import { getBasketDistribution } from './utils'
import { OpenAuctionArgs, getOpenAuction } from './open-auction'
import { getStartRebalance } from './start-rebalance'

const PRECISION = bn('1e3') // 1-part-in-1000

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

const assertRangesEqual = (a: WeightRange, b: WeightRange) => {
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
    assertRangesEqual(a.newWeights[i], b.newWeights[i])
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
  const finalStageAtForTest = 0.95 // Standard finalStageAt

  // Common expected prices for tokens [USDC (6dec), DAI (18dec), USDT (6dec)]
  // when market prices are [1,1,1], auctionPriceError is [0.01,0.01,0.01], and priceControl=true,
  // and initialPrices allow this range.
  const defaultExpectedPrices_USDC_DAI_USDT: PriceRange[] = [
    { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDC (D27 from $1, 6dec)
    { low: bn('9.9e8'), high: bn('1.01010e9') }, // DAI (D27 from $1, 18dec)
    { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDT (D27 from $1, 6dec)
  ]

  describe('Rebalancing from 100% USDC to 0% USDC, 50% DAI, 50% USDT', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimalsS1 = [bn('6'), bn('18'), bn('6')]
    const initialMarketPricesS1 = [1, 1, 1]
    const priceErrorStartRebalanceS1 = [0.1, 0.1, 0.1]
    const dtfPriceS1 = 1
    const initialFolioS1 = [bn('1e6'), bn('0'), bn('0')] // Represents 1 USDC, 0 DAI, 0 USDT per share (approx value)
    const targetBasketS1 = [bn('0'), bn('0.5e18'), bn('0.5e18')]
    // Folio representing mid-progress for ejection tests: ~20% USDC, ~40% DAI, ~40% USDT by value
    const folioMidProgressS1 = [bn('0.2e6'), bn('0.4e18'), bn('0.4e6')]
    // Folio representing near completion for ejection tests: ~1% USDC, ~49.5% DAI, ~49.5% USDT by value
    const folioNearCompletionS1 = [bn('0.01e6'), bn('0.495e18'), bn('0.495e6')]
    // Folio for Step 6 (negligible ejection, high relative progression): USDC almost gone, DAI/USDT balanced
    const folioTrueMidS1_ActuallyHighProg = [
      bn('0.00001e6'),
      bn('0.2e18'),
      bn('0.2e6'),
    ]
    // Folio for Step 7: shareValue ~1.0. USDC negligible. DAI 0.8 val, USDT 0.2 val.
    // InitialProg=0. Progression for this folio = (min(0.8,0.5)+min(0.2,0.5))/1.0 = (0.5+0.2)/1.0 = 0.7.
    // relativeProgression = 0.7 < 0.93 -> delta=0.05.
    const folioStep7S1_varied_weights = [
      bn('0.00001e6'),
      bn('0.8e18'),
      bn('0.2e6'),
    ]

    let mockRebalanceBaseS1: Omit<Rebalance, 'priceControl'>
    let initialWeightsS1: WeightRange[],
      initialPricesS1: PriceRange[],
      initialLimitsS1: RebalanceLimits

    beforeAll(() => {
      const { weights, prices, limits } = getStartRebalance(
        supply,
        tokens,
        decimalsS1,
        targetBasketS1,
        initialMarketPricesS1,
        priceErrorStartRebalanceS1,
        dtfPriceS1,
        true // weightControl: true for NATIVE-style
      )
      initialWeightsS1 = weights
      initialPricesS1 = prices
      initialLimitsS1 = limits
      mockRebalanceBaseS1 = {
        nonce: 1n,
        tokens: tokens,
        weights: initialWeightsS1, // These are the NATIVE rebalance.weights used for clamping
        initialPrices: initialPricesS1,
        inRebalance: tokens.map(() => true),
        limits: initialLimitsS1, // NATIVE limits are {1e18, 1e18, 1e18}, crucial for newLimits clamping
        startedAt: 0n,
        restrictedUntil: 0n,
        availableUntil: 0n,
      }
    })

    it('Step 0: Verifies initial setup from getStartRebalance', () => {
      expect(initialWeightsS1.length).toBe(3)
      expect(initialPricesS1.length).toBe(3)
      assertRangesEqual(initialWeightsS1[0], {
        low: bn('0'),
        spot: bn('0'),
        high: bn('0'),
      }) // USDC
      assertRangesEqual(initialWeightsS1[1], {
        low: bn('4.5e26'),
        spot: bn('5e26'),
        high: bn('5.55556e26'),
      }) // DAI
      assertRangesEqual(initialWeightsS1[2], {
        low: bn('4.5e14'),
        spot: bn('5e14'),
        high: bn('5.55556e14'),
      }) // USDT
      assertRebalanceLimitsEqual(initialLimitsS1, {
        low: bn('1e18'),
        spot: bn('1e18'),
        high: bn('1e18'),
      })
    })

    it('Step 1: Ejection Phase (initial folio, priceControl=true, prices=[1,1,1])', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        initialFolioS1,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0],
          {
            low: initialWeightsS1[1].spot,
            spot: initialWeightsS1[1].spot,
            high: initialWeightsS1[1].spot,
          },
          {
            low: initialWeightsS1[2].spot,
            spot: initialWeightsS1[2].spot,
            high: initialWeightsS1[2].spot,
          },
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS1,
      })
    })

    it('Step 2: Ejection Phase (mid-progress folio with USDC to eject)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        folioMidProgressS1,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0],
          {
            low: initialWeightsS1[1].spot,
            spot: initialWeightsS1[1].spot,
            high: initialWeightsS1[1].spot,
          },
          {
            low: initialWeightsS1[2].spot,
            spot: initialWeightsS1[2].spot,
            high: initialWeightsS1[2].spot,
          },
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS1,
      })
    })

    it('Step 3: Ejection Phase (near-completion folio with USDC to eject)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        folioNearCompletionS1,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0],
          {
            low: initialWeightsS1[1].spot,
            spot: initialWeightsS1[1].spot,
            high: initialWeightsS1[1].spot,
          },
          {
            low: initialWeightsS1[2].spot,
            spot: initialWeightsS1[2].spot,
            high: initialWeightsS1[2].spot,
          },
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS1,
      })
    })

    it('Step 4: Ejection Phase (initial folio, priceControl=false, prices=[1,1,1])', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: false,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        initialFolioS1,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0],
          {
            low: initialWeightsS1[1].spot,
            spot: initialWeightsS1[1].spot,
            high: initialWeightsS1[1].spot,
          },
          {
            low: initialWeightsS1[2].spot,
            spot: initialWeightsS1[2].spot,
            high: initialWeightsS1[2].spot,
          },
        ],
        newPrices: initialPricesS1, // from mockRebalance due to priceControl=false
        newLimits: initialLimitsS1,
      })
    })

    it('Step 5: Ejection Phase (initial folio, USDC Price Loss 0.9, priceControl=true)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      const pricesS1_loss = [0.9, 1, 1]
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        initialFolioS1,
        decimalsS1,
        pricesS1_loss,
        auctionPriceError,
        finalStageAtForTest
      )
      const expectedNewPricesLoss: PriceRange[] = [
        { low: bn('9e20'), high: bn('9.09091e20') },
        { low: bn('9.9e8'), high: bn('1.01010e9') },
        { low: bn('9.9e20'), high: bn('1.01010e21') },
      ]
      // Ideal spots for DAI/USDT scaled by 0.9 (due to USDC price drop impacting shareValue for idealWeight calc)
      // DAI idealSpot was 5e26, now 5e26*0.9 = 4.5e26. USDT idealSpot was 5e14, now 5e14*0.9 = 4.5e14.
      // Delta is 0 (ejection). So newWeights low/spot/high are these new ideal spots, clamped by rebalance.weights.
      // The new ideal spots (4.5e26, 4.5e14) are exactly the .low of their respective rebalance.weights, so clamping to .low results in this value.
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0], // USDC target 0
          { low: bn('4.5e26'), spot: bn('4.5e26'), high: bn('4.5e26') },
          { low: bn('4.5e14'), spot: bn('4.5e14'), high: bn('4.5e14') },
        ],
        newPrices: expectedNewPricesLoss,
        newLimits: initialLimitsS1,
      })
    })

    it('Step 6: Test Case: Negligible Ejection, High Relative Progression -> Delta=0', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        folioTrueMidS1_ActuallyHighProg,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0],
          {
            low: initialWeightsS1[1].low,
            spot: initialWeightsS1[1].low,
            high: initialWeightsS1[1].low,
          },
          {
            low: initialWeightsS1[2].low,
            spot: initialWeightsS1[2].low,
            high: initialWeightsS1[2].low,
          },
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS1,
      })
    })

    it('Step 7: NATIVE Mid-Rebalance (Multi-Asset Target, Negligible Ejection, Low Relative Progression -> Varied Weights)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS1,
        priceControl: true,
      }
      // Using folioStep7S1_varied_weights: shareValue ~1.0, relativeProgression ~0.7 -> delta=0.05.
      // ideal_DAI/USDT_whole_spot ~0.5 (since shareValue*0.5 = 0.5).
      // This ideal_spot is same as initialWeightsS1[i].spot_whole.
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS1,
        targetBasketS1,
        folioStep7S1_varied_weights,
        decimalsS1,
        initialMarketPricesS1,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 1n,
        tokens: tokens,
        newWeights: [
          initialWeightsS1[0], // USDC target 0
          // DAI: ideal_whole=0.5. calc_low=0.475, calc_spot=0.5, calc_high=0.525.
          // initialWeight_DAI (whole): low=0.45, spot=0.5, high=~0.555. All calculated values are within this range.
          { low: bn('4.75e26'), spot: bn('5e26'), high: bn('5.25e26') },
          // USDT: ideal_whole=0.5. calc_low=0.475, calc_spot=0.5, calc_high=0.525.
          // initialWeight_USDT (whole): low=0.45, spot=0.5, high=~0.555. All calculated values are within this range.
          { low: bn('4.75e14'), spot: bn('5e14'), high: bn('5.25e14') },
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS1, // newLimits will be clamped to initial flat NATIVE limits
      })
    })
  })

  describe('Rebalancing from 0% USDC, 50% DAI, 50% USDT to 100% USDC', () => {
    const tokens = ['USDC', 'DAI', 'USDT']
    const decimalsS2 = [bn('6'), bn('18'), bn('6')]
    const initialMarketPricesS2 = [1, 1, 1]
    const priceErrorStartRebalanceS2 = [0.1, 0.1, 0.1]
    const dtfPriceS2 = 1
    // initialFolioS2: approx 0 USDC, 0.5 DAI val, 0.5 USDT val (total val 1 USD for 1 share)
    const initialFolioS2 = [bn('0'), bn('0.5e18'), bn('0.5e6')]
    const targetBasketS2 = [bn('1e18'), bn('0'), bn('0')] // Target 100% USDC
    // Folio for mid-progress ejection tests: ~40% USDC, ~30% DAI, ~30% USDT by value
    const folioMidProgressS2 = [bn('0.4e6'), bn('0.3e18'), bn('0.3e6')]
    // Folio for near completion ejection tests: ~98% USDC, ~1% DAI, ~1% USDT by value
    const folioTrulyNearCompletionS2 = [
      bn('0.98e6'),
      bn('0.01e18'),
      bn('0.01e6'),
    ]
    // Folio for Step 6 (negligible ejection, high relative progression): DAI/USDT almost gone
    const folioTrueMidS2_ActuallyHighProg = [
      bn('0.4e6'),
      bn('0.00001e18'),
      bn('0.00001e6'),
    ]

    let mockRebalanceBaseS2: Omit<Rebalance, 'priceControl'>
    let initialWeightsS2: WeightRange[],
      initialPricesS2: PriceRange[],
      initialLimitsS2: RebalanceLimits

    beforeAll(() => {
      const { weights, prices, limits } = getStartRebalance(
        supply,
        tokens,
        decimalsS2,
        targetBasketS2,
        initialMarketPricesS2,
        priceErrorStartRebalanceS2,
        dtfPriceS2,
        true
      )
      initialWeightsS2 = weights
      initialPricesS2 = prices
      initialLimitsS2 = limits
      mockRebalanceBaseS2 = {
        nonce: 2n, // Different nonce for this scenario suite
        tokens: tokens,
        weights: initialWeightsS2,
        initialPrices: initialPricesS2,
        inRebalance: tokens.map(() => true),
        limits: initialLimitsS2,
        startedAt: 0n,
        restrictedUntil: 0n,
        availableUntil: 0n,
      }
    })

    it('Step 0: Verifies initial setup from getStartRebalance', () => {
      expect(initialWeightsS2.length).toBe(3)
      // USDC target 100%
      assertRangesEqual(initialWeightsS2[0], {
        low: bn('9e14'),
        spot: bn('1e15'),
        high: bn('1.11111e15'),
      })
      assertRangesEqual(initialWeightsS2[1], {
        low: bn('0'),
        spot: bn('0'),
        high: bn('0'),
      }) // DAI target 0%
      assertRangesEqual(initialWeightsS2[2], {
        low: bn('0'),
        spot: bn('0'),
        high: bn('0'),
      }) // USDT target 0%
      assertRebalanceLimitsEqual(initialLimitsS2, {
        low: bn('1e18'),
        spot: bn('1e18'),
        high: bn('1e18'),
      })
    })

    it('Step 1: Ejection Phase (initial folio, priceControl=true, prices=[1,1,1])', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        initialFolioS2,
        decimalsS2,
        initialMarketPricesS2,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          {
            low: initialWeightsS2[0].spot,
            spot: initialWeightsS2[0].spot,
            high: initialWeightsS2[0].spot,
          },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS2,
      })
    })

    it('Step 2: Ejection Phase (mid-progress folio with DAI/USDT to eject)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        folioMidProgressS2,
        decimalsS2,
        initialMarketPricesS2,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          {
            low: initialWeightsS2[0].spot,
            spot: initialWeightsS2[0].spot,
            high: initialWeightsS2[0].spot,
          },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS2,
      })
    })

    it('Step 3: Ejection Phase (near-completion folio with DAI/USDT to eject)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        folioTrulyNearCompletionS2,
        decimalsS2,
        initialMarketPricesS2,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          {
            low: initialWeightsS2[0].spot,
            spot: initialWeightsS2[0].spot,
            high: initialWeightsS2[0].spot,
          },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS2,
      })
    })

    it('Step 4: Ejection Phase (initial folio, USDC Price Drop 0.9 - Gain for Buyer, priceControl=true)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const pricesS2_USDCdrop = [0.9, 1, 1] // USDC price drops, good for us as we target USDC
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        initialFolioS2,
        decimalsS2,
        pricesS2_USDCdrop,
        auctionPriceError,
        finalStageAtForTest
      )
      // Expected: rebalanceTarget=1, delta=0. idealWeight for USDC changes due to its price drop.
      // shareValue (of initialFolioS2) = 0.5*1 (DAI) + 0.5*1 (USDT) = 1 (approx, using scaled folio values)
      // idealSpotWeight_USDC = shareValue * targetBasket_USDC[0] / actualLimits.spot / prices_USDC[0.9]
      // idealSpot_USDC_D27 was 1e15 at price 1. At price 0.9, idealSpot_D27 becomes 1e15 / 0.9 = 1.111...e15.
      const expectedNewPricesGainUSDC: PriceRange[] = [
        { low: bn('9e20'), high: bn('9.09091e20') },
        { low: bn('9.9e8'), high: bn('1.01010e9') },
        { low: bn('9.9e20'), high: bn('1.01010e21') },
      ]
      // This new ideal spot (1.111...e15) is clamped by initialWeightsS2[0].high (1.11111e15).
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          {
            low: bn('1.11111e15'),
            spot: bn('1.11111e15'),
            high: bn('1.11111e15'),
          },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: expectedNewPricesGainUSDC,
        newLimits: initialLimitsS2,
      })
    })

    it('Step 5: Ejection Phase (initial folio, USDC Price Rise 1.1 - Loss for Buyer, priceControl=true)', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const pricesS2_USDCrise = [1.1, 1, 1]
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        initialFolioS2,
        decimalsS2,
        pricesS2_USDCrise,
        auctionPriceError,
        finalStageAtForTest
      )
      // Expected: rebalanceTarget=1, delta=0. idealWeight for USDC changes.
      // idealSpot_USDC_D27 was 1e15 at price 1. At price 1.1, idealSpot_D27 becomes 1e15 / 1.1 = 9.09091e14.
      const expectedNewPricesLossUSDC: PriceRange[] = [
        { low: bn('1.089e21'), high: bn('1.11111e21') },
        { low: bn('9.9e8'), high: bn('1.01010e9') },
        { low: bn('9.9e20'), high: bn('1.01010e21') },
      ]
      // This new ideal spot (9.09091e14) is clamped by initialWeightsS2[0].low (9e14), so becomes 9.09091e14.
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          {
            low: bn('9.09091e14'),
            spot: bn('9.09091e14'),
            high: bn('9.09091e14'),
          },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: expectedNewPricesLossUSDC,
        newLimits: initialLimitsS2,
      })
    })

    it('Step 6: Test Case: Negligible Ejection, High Relative Progression (Single Target Asset) -> Delta=0', () => {
      const mockRebalance: Rebalance = {
        ...mockRebalanceBaseS2,
        priceControl: true,
      }
      const [openAuctionArgs] = getOpenAuction(
        mockRebalance,
        supply,
        initialFolioS2,
        targetBasketS2,
        folioTrueMidS2_ActuallyHighProg,
        decimalsS2,
        initialMarketPricesS2,
        auctionPriceError,
        finalStageAtForTest
      )
      assertOpenAuctionArgsEqual(openAuctionArgs, {
        rebalanceNonce: 2n,
        tokens: tokens,
        newWeights: [
          { low: bn('9e14'), spot: bn('9e14'), high: bn('9e14') },
          initialWeightsS2[1],
          initialWeightsS2[2],
        ],
        newPrices: defaultExpectedPrices_USDC_DAI_USDT,
        newLimits: initialLimitsS2,
      })
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
      true // weightControl: true
    )
    expect(newWeights.length).toBe(2)
    expect(newPricesResult.length).toBe(2)

    assertRangesEqual(newWeights[0], {
      // USDC
      low: bn('6.75e14'),
      spot: bn('7.5e14'),
      high: bn('8.33333e14'),
    })
    assertRangesEqual(newWeights[1], {
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
        true // weightControl: true
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
  const _folioUSDCStart = [bn('1e6'), bn('0'), bn('0')] // 100% USDC, use as initialFolio for this sequence

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
    false // weightControl: false for TRACKING-style weights and limits
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
    assertRangesEqual(initialWeightsTracking[0], {
      low: bn('0'),
      spot: bn('0'),
      high: bn('0'),
    }) // USDC
    assertRangesEqual(initialWeightsTracking[1], {
      low: bn('5e26'),
      spot: bn('5e26'),
      high: bn('5e26'),
    }) // DAI
    assertRangesEqual(initialWeightsTracking[2], {
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
    const _folio1 = _folioUSDCStart // 100% USDC, needs ejection
    const currentMarketPrices1 = [1, 1, 1]
    const mockRebalance1: Rebalance = {
      ...mockRebalanceBase,
      priceControl: true,
    }

    const [openAuctionArgs1] = getOpenAuction(
      mockRebalance1,
      supply,
      _folioUSDCStart, // _initialFolio
      targetBasketUSDCtoDAIUST,
      _folio1, // current _folio
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
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
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
    // progression = (0.3+0.5)/1 = 0.8. initialProgression (from _folioUSDCStart) = 0.
    // relativeProgression = (0.8 - 0) / (1 - 0) = 0.8.
    // finalStageAt = 0.95. threshold = 0.95 - 0.02 = 0.93. 0.8 < 0.93 is TRUE.
    const _folio2 = [bn('0'), bn('3e17'), bn('7e5')] // Corresponds to 0.3 DAI, 0.7 USDT, total value $1
    const currentMarketPrices2 = [1, 1, 1]
    const mockRebalance2: Rebalance = {
      ...mockRebalanceBase,
      priceControl: true,
    }

    const [openAuctionArgs2] = getOpenAuction(
      mockRebalance2,
      supply,
      _folioUSDCStart, // _initialFolio
      targetBasketUSDCtoDAIUST,
      _folio2, // current _folio
      decimals,
      currentMarketPrices2,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Expected: buyTarget=0.95 (finalStageAt). idealSpotLimit=1. limitDelta=0.05.
    // newLimits pre-clamp: low=0.95e18, spot=1e18, high=1.05e18.
    // Clamped by initialLimitsTracking (9e17,1e18,1.11111e18):
    // low=max(0.95e18,9e17)=9.5e17. spot=1e18. high=min(1.05e18,1.11111e18)=1.05e18.
    assertRebalanceLimitsEqual(openAuctionArgs2.newLimits, {
      low: bn('9.5e17'),
      spot: bn('1e18'),
      high: bn('1.05e18'),
    })
    expect(openAuctionArgs2.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
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
    // DAI: exp=0.5, actual=0.48, inBU=0.48. USDT: exp=0.5, actual=0.52, inBU=0.5.
    // progression = (0.48+0.5)/1 = 0.98. initialProgression = 0.
    // relativeProgression = (0.98 - 0) / (1-0) = 0.98.
    // finalStageAt = 0.95. threshold = 0.95 - 0.02 = 0.93. 0.98 < 0.93 is FALSE.
    const _folio3 = [bn('0'), bn('4.8e17'), bn('5.2e5')] // Corresponds to 0.48 DAI, 0.52 USDT, total value $1
    const currentMarketPrices3 = [1, 1, 1]
    const mockRebalance3: Rebalance = {
      ...mockRebalanceBase,
      priceControl: true,
    }

    const [openAuctionArgs3] = getOpenAuction(
      mockRebalance3,
      supply,
      _folioUSDCStart, // _initialFolio
      targetBasketUSDCtoDAIUST,
      _folio3, // current _folio
      decimals,
      currentMarketPrices3,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    // Expected: buyTarget=1. idealSpotLimit=1. limitDelta=0.
    // newLimits pre-clamp: low=1e18, spot=1e18, high=1e18.
    // Clamped by initialLimitsTracking (9e17,1e18,1.11111e18) -> no change.
    assertRebalanceLimitsEqual(openAuctionArgs3.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })
    expect(openAuctionArgs3.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
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
  const supply = bn('1e21')
  const tokens = ['USDC', 'DAI', 'USDT']
  const decimals = [bn('6'), bn('18'), bn('6')]
  const auctionPriceErrorSmall = [0.01, 0.01, 0.01]
  const finalStageAtForTest = 0.95
  const targetBasketHybrid = [bn('0'), bn('5e17'), bn('5e17')]
  const hybridWeights: WeightRange[] = [
    { low: bn('0'), spot: bn('0'), high: bn('0') },
    { low: bn('4.5e26'), spot: bn('5e26'), high: bn('5.55556e26') },
    { low: bn('4.5e14'), spot: bn('5e14'), high: bn('5.55556e14') },
  ]
  const hybridInitialPrices: PriceRange[] = [
    { low: bn('9e20'), high: bn('1.11111e21') },
    { low: bn('9e8'), high: bn('1.11111e9') },
    { low: bn('9e20'), high: bn('1.11111e21') },
  ]
  const hybridLimits_veryWide: RebalanceLimits = {
    low: bn('1'),
    spot: bn('1e18'),
    high: bn('1e36'),
  }
  const mockRebalanceHybridBase: Omit<Rebalance, 'priceControl'> = {
    nonce: 3n,
    tokens: tokens,
    weights: hybridWeights,
    initialPrices: hybridInitialPrices,
    limits: hybridLimits_veryWide,
    inRebalance: tokens.map(() => true),
    startedAt: 0n,
    restrictedUntil: 0n,
    availableUntil: 0n,
  }
  const currentMarketPrices_Hybrid = [1, 1, 1] // Defined for this scope

  const defaultPricesHybridScope: PriceRange[] = [
    { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDC
    { low: bn('9.9e8'), high: bn('1.01010e9') }, // DAI
    { low: bn('9.9e20'), high: bn('1.01010e21') }, // USDT
  ]

  it('Hybrid Scenario 1: Mid-Rebalance (progression < finalStageAt)', () => {
    const _folio = [bn('0'), bn('3e17'), bn('7e5')]
    const mockRebalanceHybrid: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: true,
    }
    const [openAuctionArgs] = getOpenAuction(
      mockRebalanceHybrid,
      supply,
      _folio,
      targetBasketHybrid,
      _folio,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )
    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, {
      low: bn('9.5e17'),
      spot: bn('1e18'),
      high: bn('1.05e18'),
    })
    expect(openAuctionArgs.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
    ])
    assertPricesEqual(openAuctionArgs.newPrices[0], defaultPricesHybridScope[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], defaultPricesHybridScope[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], defaultPricesHybridScope[2])
  })

  it('Hybrid Scenario 2: Near Completion (progression >= finalStageAt)', () => {
    const _folio = [bn('0'), bn('4.8e17'), bn('5.2e5')]
    const mockRebalanceHybrid: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: true,
    }
    const [openAuctionArgs] = getOpenAuction(
      mockRebalanceHybrid,
      supply,
      _folio,
      targetBasketHybrid,
      _folio,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )
    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, {
      low: bn('9.5e17'),
      spot: bn('1e18'),
      high: bn('1.05e18'),
    })
    expect(openAuctionArgs.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
    ])
    assertPricesEqual(openAuctionArgs.newPrices[0], defaultPricesHybridScope[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], defaultPricesHybridScope[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], defaultPricesHybridScope[2])
  })

  it('Hybrid Scenario 3: Custom finalStageAt (0.8) - Round 1 & Round 2', () => {
    const finalStageAtCustom = 0.8
    const mockRebalanceHybridCustom: Rebalance = {
      ...mockRebalanceHybridBase,
      priceControl: true,
    }
    const _folioRound1 = [bn('0'), bn('2e17'), bn('8e5')]
    const [openAuctionArgsCustomRound1] = getOpenAuction(
      mockRebalanceHybridCustom,
      supply,
      _folioRound1,
      targetBasketHybrid,
      _folioRound1,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtCustom
    )
    assertRebalanceLimitsEqual(openAuctionArgsCustomRound1.newLimits, {
      low: bn('8e17'),
      spot: bn('1e18'),
      high: bn('1.2e18'),
    })
    expect(openAuctionArgsCustomRound1.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
    ])
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[0],
      defaultPricesHybridScope[0]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[1],
      defaultPricesHybridScope[1]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound1.newPrices[2],
      defaultPricesHybridScope[2]
    )

    const _folioRound2 = [bn('0'), bn('4e17'), bn('6e5')]
    const [openAuctionArgsCustomRound2] = getOpenAuction(
      mockRebalanceHybridCustom,
      supply,
      _folioRound1,
      targetBasketHybrid,
      _folioRound2,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtCustom
    )
    assertRebalanceLimitsEqual(openAuctionArgsCustomRound2.newLimits, {
      low: bn('8e17'),
      spot: bn('1e18'),
      high: bn('1.2e18'),
    })
    expect(openAuctionArgsCustomRound2.newWeights).toEqual([
      { low: bn('0'), spot: bn('0'), high: bn('0') },
      { low: bn('5e26'), spot: bn('5e26'), high: bn('5e26') },
      { low: bn('5e14'), spot: bn('5e14'), high: bn('5e14') },
    ])
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[0],
      defaultPricesHybridScope[0]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[1],
      defaultPricesHybridScope[1]
    )
    assertPricesEqual(
      openAuctionArgsCustomRound2.newPrices[2],
      defaultPricesHybridScope[2]
    )
  })

  it('Hybrid Scenario 4: Delta split between Limits and Weights', () => {
    const _folioForS4 = [bn('0'), bn('2e17'), bn('8e5')] // 0 USDC, 0.2 DAI val, 0.8 USDT val; shareVal=1.0
    const scenario4Limits: RebalanceLimits = {
      low: bn('0.98e18'),
      spot: bn('1e18'),
      high: bn('1.02e18'),
    }
    const mockRebalanceHybrid4: Rebalance = {
      ...mockRebalanceHybridBase,
      nonce: 4n,
      limits: scenario4Limits,
      priceControl: true,
    }
    const [openAuctionArgs] = getOpenAuction(
      mockRebalanceHybrid4,
      supply,
      _folioForS4,
      targetBasketHybrid,
      _folioForS4,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, scenario4Limits)
    assertPricesEqual(openAuctionArgs.newPrices[0], defaultPricesHybridScope[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], defaultPricesHybridScope[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], defaultPricesHybridScope[2])

    const spotDAI_D27 = hybridWeights[1].spot // bn('5e26')
    const spotUSDT_D27 = hybridWeights[2].spot // bn('5e14')

    expect(openAuctionArgs.newWeights.length).toBe(3)
    assertRangesEqual(openAuctionArgs.newWeights[0], hybridWeights[0])
    assertRangesEqual(openAuctionArgs.newWeights[1], {
      low: bn('4.847e26'),
      spot: spotDAI_D27,
      high: bn('5.147e26'),
    })
    assertRangesEqual(openAuctionArgs.newWeights[2], {
      low: bn('4.847e14'),
      spot: spotUSDT_D27,
      high: bn('5.147e14'),
    })
  })

  it('Hybrid Scenario 5: Already Balanced Folio (rebalanceTarget=1, delta=0)', () => {
    const _folioAlreadyBalancedAndShareValue1 = [bn('0'), bn('5e17'), bn('5e5')]
    const mockRebalanceHybrid5: Rebalance = {
      ...mockRebalanceHybridBase,
      nonce: 5n,
      priceControl: true,
    }
    const [openAuctionArgs] = getOpenAuction(
      mockRebalanceHybrid5,
      supply,
      _folioAlreadyBalancedAndShareValue1,
      targetBasketHybrid,
      _folioAlreadyBalancedAndShareValue1,
      decimals,
      currentMarketPrices_Hybrid,
      auctionPriceErrorSmall,
      finalStageAtForTest
    )

    assertRebalanceLimitsEqual(openAuctionArgs.newLimits, {
      low: bn('1e18'),
      spot: bn('1e18'),
      high: bn('1e18'),
    })

    assertPricesEqual(openAuctionArgs.newPrices[0], defaultPricesHybridScope[0])
    assertPricesEqual(openAuctionArgs.newPrices[1], defaultPricesHybridScope[1])
    assertPricesEqual(openAuctionArgs.newPrices[2], defaultPricesHybridScope[2])

    // For USDT (index 2), hybridWeights[2].spot is bn('5e14').
    // As deduced, all components of openAuctionArgs.newWeights[2] should also be bn('5e14').
    // Making the assertion explicit with hardcoded values to test exactness.
    expect(openAuctionArgs.newWeights.length).toBe(3)
    assertRangesEqual(openAuctionArgs.newWeights[0], hybridWeights[0]) // USDC {0,0,0}
    assertRangesEqual(openAuctionArgs.newWeights[1], {
      low: hybridWeights[1].spot,
      spot: hybridWeights[1].spot,
      high: hybridWeights[1].spot,
    })
    assertRangesEqual(openAuctionArgs.newWeights[2], {
      low: bn('5e14'),
      spot: bn('5e14'),
      high: bn('5e14'),
    })
  })
})

describe('Price Clamping Edge Cases in getOpenAuction', () => {
  const supply = bn('1e21')
  const tokens = ['USDC', 'DAI']
  const decimals = [bn('6'), bn('18')]
  const auctionPriceErrorSmall = [0.01, 0.01]
  const targetBasketSimple = [bn('5e17'), bn('5e17')] // 50% USDC, 50% DAI
  const currentMarketPrices = [1, 1]
  const folioSimple = [bn('5e5'), bn('5e17')] // Example folio, value $1

  it('should throw "no price range" if current price forces new low > initial high, and new high clamps to initial high', () => {
    const initialPricesNarrowUSDC: PriceRange[] = [
      { low: bn('8e20'), high: bn('8.5e20') }, // USDC: Narrow, low range (0.8 - 0.85)
      { low: bn('9e8'), high: bn('1.11111e9') }, // DAI: Normal range
    ]

    const mockRebalanceEdge: Rebalance = {
      nonce: 4n,
      tokens: tokens,
      weights: [
        { low: bn('4.5e14'), spot: bn('5e14'), high: bn('5.5e14') },
        { low: bn('4.5e26'), spot: bn('5e26'), high: bn('5.5e26') },
      ],
      initialPrices: initialPricesNarrowUSDC,
      inRebalance: tokens.map(() => true),
      limits: { low: bn('1'), spot: bn('1e18'), high: bn('1e36') }, // Wide limits
      startedAt: 0n,
      restrictedUntil: 0n,
      availableUntil: 0n,
      priceControl: true,
    }

    // Current USDC market price is $1.0, auction error 0.01
    // Calculated pricesD27.low for USDC (based on $1.0 * 0.99 = $0.99) would be bn('9.9e20').
    // This is > initialPricesNarrowUSDC[0].high (bn('8.5e20')).
    // So, pricesD27.low for USDC becomes bn('8.5e20').
    // Calculated pricesD27.high for USDC (based on $1.0 / 0.99 = $1.0101) would be bn('1.01010e21').
    // This is > initialPricesNarrowUSDC[0].high (bn('8.5e20')).
    // So, pricesD27.high for USDC also becomes bn('8.5e20').
    // Thus, pricesD27.low == pricesD27.high, triggering the error.

    expect(() => {
      getOpenAuction(
        mockRebalanceEdge,
        supply,
        folioSimple, // _initialFolio
        targetBasketSimple,
        folioSimple, // current _folio
        decimals,
        currentMarketPrices, // USDC price at $1.0
        auctionPriceErrorSmall, // USDC error at 0.01
        0.95
      )
    }).toThrow('no price range')
  })
})
