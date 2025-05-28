import Decimal from 'decimal.js-light'

import { bn, D18d, D27d, ONE, ZERO } from './numbers'

import {
  PriceControl,
  PriceRange,
  Rebalance,
  RebalanceLimits,
  WeightRange,
} from './types'

// Call `getOpenAuction()` to get the current auction round
export enum AuctionRound {
  EJECT = 0,
  PROGRESS = 1,
  FINAL = 2,
}

/**
 * Useful metrics to use to visualize things
 *
 * @param initialProgression {1} The progression the Folio had when the auction was first proposed
 * @param absoluteProgression {1} The progression of the auction on an absolute scale
 * @param relativeProgression {1} The relative progression of the auction
 * @param target {1} The target of the auction on an absolute scale
 * @param auctionSize {USD} The total value on sale in the auction
 * @param surplusTokens The list of tokens in surplus
 * @param deficitTokens The list of tokens in deficit
 */
export interface AuctionMetrics {
  round: AuctionRound
  initialProgression: number
  absoluteProgression: number
  relativeProgression: number
  target: number
  auctionSize: number
  surplusTokens: string[]
  deficitTokens: string[]
}

// All the args needed to call `folio.openAuction()`
export interface OpenAuctionArgs {
  rebalanceNonce: bigint
  tokens: string[]
  newWeights: WeightRange[]
  newPrices: PriceRange[]
  newLimits: RebalanceLimits
}

/**
 * Generator for the `targetBasket` parameter
 *
 * Depending on the usecase, pass either:
 * - TRACKING: CURRENT prices
 * - NATIVE: HISTORICAL prices
 *
 * @param _initialWeights D27{tok/BU} The initial historical weights emitted in the RebalanceStarted event
 * @param _prices {USD/wholeTok} either CURRENT or HISTORICAL prices
 * @returns D18{1} The target basket
 */
export const getTargetBasket = (
  _initialWeights: WeightRange[],
  _prices: number[],
  _decimals: bigint[]
): bigint[] => {
  if (_initialWeights.length != _prices.length) {
    throw new Error('length mismatch')
  }

  const vals = _initialWeights.map((initialWeight: WeightRange, i: number) => {
    const price = new Decimal(_prices[i])
    const decimalScale = new Decimal(`1e${_decimals[i]}`)

    // {USD/wholeBU} = D27{tok/BU} * {BU/wholeBU} / {tok/wholeTok} / D27 * {USD/wholeTok}
    return new Decimal(initialWeight.spot.toString())
      .mul(D18d)
      .div(decimalScale)
      .div(D27d)
      .mul(price)
  })

  const totalValue = vals.reduce((a, b) => a.add(b))

  // D18{1} = {USD/wholeBU} / {USD/wholeBU} * D18
  return vals.map((val) => bn(val.div(totalValue).mul(D18d)))
}

/**
 * Get the values needed to call `folio.openAuction()` as the AUCTION_LAUNCHER
 *
 * Non-AUCTION_LAUNCHERs should use `folio.openAuctionUnrestricted()`
 *
 * @param rebalance The result of calling folio.getRebalance()
 * @param _supply {share} The totalSupply() of the basket, today
 * @param _initialFolio D18{tok/share} Initial balances per share, e.g result of folio.toAssets(1e18, 0) at time rebalance was first proposed
 * @param _targetBasket D18{1} Result of calling `getTargetBasket()`
 * @param _folio D18{tok/share} Current ratio of token per share, e.g result of folio.toAssets(1e18, 0)
 * @param _decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error to use for each token during auction pricing; should be smaller than price error during startRebalance
 * @param _finalStageAt {1} The % rebalanced from the initial Folio to determine when is the final stage of the rebalance
 */
export const getOpenAuction = (
  rebalance: Rebalance,
  _supply: bigint,
  _initialFolio: bigint[] = [],
  _targetBasket: bigint[] = [],
  _folio: bigint[],
  _decimals: bigint[],
  _prices: number[],
  _priceError: number[],
  _finalStageAt: number = 0.9
): [OpenAuctionArgs, AuctionMetrics] => {
  console.log('getOpenAuction')

  if (
    rebalance.tokens.length != _targetBasket.length ||
    _targetBasket.length != _folio.length ||
    _folio.length != _decimals.length ||
    _decimals.length != _prices.length ||
    _prices.length != _priceError.length
  ) {
    throw new Error('length mismatch')
  }

  if (_finalStageAt >= 1) {
    throw new Error('finalStageAt must be less than 1')
  }

  // ================================================================

  // {wholeShare} = {share} / {share/wholeShare}
  const supply = new Decimal(_supply.toString()).div(D18d)

  // {1} = D18{1} / D18
  const targetBasket = _targetBasket.map((a) =>
    new Decimal(a.toString()).div(D18d)
  )

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {1}
  const priceError = _priceError.map((a) => new Decimal(a.toString()))

  // {tok/wholeTok}
  const decimalScale = _decimals.map((a) => new Decimal(`1e${a}`))

  // {wholeTok/wholeShare} = D18{tok/share} * {share/wholeShare} / {tok/wholeTok} / D18
  const initialFolio = _initialFolio.map((c: bigint, i: number) =>
    new Decimal(c.toString()).div(decimalScale[i])
  )

  // {wholeTok/wholeShare} = D18{tok/share} * {share/wholeShare} / {tok/wholeTok} / D18
  const folio = _folio.map((c: bigint, i: number) =>
    new Decimal(c.toString()).div(decimalScale[i])
  )

  // {wholeTok/wholeBU} = D27{tok/BU} * {BU/wholeBU} / {tok/wholeTok} / D27
  let weightRanges = rebalance.weights.map((range: WeightRange, i: number) => {
    return {
      low: new Decimal(range.low.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
      spot: new Decimal(range.spot.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
      high: new Decimal(range.high.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
    }
  })

  const finalStageAt = new Decimal(_finalStageAt.toString())

  // ================================================================

  // calculate ideal spot limit, the actual BU<->share ratio

  // {USD/wholeShare} = {wholeTok/wholeShare} * {USD/wholeTok}
  const shareValue = folio
    .map((f: Decimal, i: number) => f.mul(prices[i]))
    .reduce((a, b) => a.add(b))

  // {USD/wholeBU} = {wholeTok/wholeBU} * {USD/wholeTok}
  const buValue = weightRanges
    .map((weightRange, i) => weightRange.spot.mul(prices[i]))
    .reduce((a, b) => a.add(b))

  // ================================================================

  // calculate rebalanceTarget

  const ejectionIndices: number[] = []
  for (let i = 0; i < rebalance.weights.length; i++) {
    if (rebalance.weights[i].spot == 0n) {
      ejectionIndices.push(i)
    }
  }

  // {1} = {wholeTok/wholeShare} * {USD/wholeTok} / {USD/wholeShare}
  const portionBeingEjected = ejectionIndices
    .map((i) => folio[i].mul(prices[i]))
    .reduce((a, b) => a.add(b), ZERO)
    .div(shareValue)

  // {1} = {USD/wholeShare} / {USD/wholeShare}
  let progression = folio
    .map((actualBalance, i) => {
      // {wholeTok/wholeShare} = {USD/wholeShare} * {1} / {USD/wholeTok}
      const balanceExpected = shareValue.mul(targetBasket[i]).div(prices[i])

      // {wholeTok/wholeShare} = {wholeTok/wholeBU} * {wholeBU/wholeShare}
      const balanceInBU = balanceExpected.gt(actualBalance)
        ? actualBalance
        : balanceExpected

      // {USD/wholeShare} = {wholeTok/wholeShare} * {USD/wholeTok}
      return balanceInBU.mul(prices[i])
    })
    .reduce((a, b) => a.add(b))
    .div(shareValue)

  // {1} = {USD/wholeShare} / {USD/wholeShare}
  const initialProgression = initialFolio
    .map((initialBalance, i) => {
      // {wholeTok/wholeShare} = {USD/wholeShare} * {1} / {USD/wholeTok}
      const balanceExpected = shareValue.mul(targetBasket[i]).div(prices[i])

      // {wholeTok/wholeShare} = {wholeTok/wholeBU} * {wholeBU/wholeShare}
      const balanceInBU = balanceExpected.gt(initialBalance)
        ? initialBalance
        : balanceExpected

      // {USD/wholeShare} = {wholeTok/wholeShare} * {USD/wholeTok}
      return balanceInBU.mul(prices[i])
    })
    .reduce((a, b) => a.add(b))
    .div(shareValue)

  if (progression < initialProgression) {
    progression = initialProgression // don't go backwards
  }

  // {1} = {1} / {1}
  const relativeProgression = initialProgression.eq(ONE)
    ? ONE
    : progression.sub(initialProgression).div(ONE.sub(initialProgression))

  let rebalanceTarget = ONE
  let round: AuctionRound = AuctionRound.FINAL

  // make it an eject auction if there is 1 bps or more of value to eject
  if (portionBeingEjected.gte(1e-4)) {
    round = AuctionRound.EJECT

    rebalanceTarget = progression.add(portionBeingEjected.mul(1.5)) // set rebalanceTarget to 50% more than needed, to ensure ejection completes
    if (rebalanceTarget.gt(ONE)) {
      rebalanceTarget = ONE
    }
  } else if (relativeProgression.lt(finalStageAt.sub(0.02))) {
    // wiggle room to prevent having to re-run an auction at the same stage after price movement
    round = AuctionRound.PROGRESS

    rebalanceTarget = finalStageAt
  }

  // {1}
  const delta = ONE.sub(rebalanceTarget)

  // ================================================================

  // get new limits, constrained by extremes

  // {wholeBU/wholeShare} = {USD/wholeShare} / {USD/wholeBU}
  const spotLimit = shareValue.div(buValue)

  // D18{BU/share} = {wholeBU/wholeShare} * D18 * {1}
  const newLimits = {
    low: bn(spotLimit.sub(spotLimit.mul(delta)).mul(D18d)),
    spot: bn(spotLimit.mul(D18d)),
    high: bn(spotLimit.add(spotLimit.mul(delta)).mul(D18d)),
  }

  // low
  if (newLimits.low < rebalance.limits.low) {
    newLimits.low = rebalance.limits.low
  }
  if (newLimits.low > rebalance.limits.high) {
    newLimits.low = rebalance.limits.high
  }

  // spot
  if (newLimits.spot < rebalance.limits.low) {
    newLimits.spot = rebalance.limits.low
  }
  if (newLimits.spot > rebalance.limits.high) {
    newLimits.spot = rebalance.limits.high
  }

  // high
  if (newLimits.high < rebalance.limits.low) {
    newLimits.high = rebalance.limits.low
  }
  if (newLimits.high > rebalance.limits.high) {
    newLimits.high = rebalance.limits.high
  }

  // ================================================================

  // get new weights, constrained by extremes

  // {wholeBU/wholeShare} = D18{BU/share} / D18
  const actualLimits = {
    low: new Decimal(newLimits.low.toString()).div(D18d),
    spot: new Decimal(newLimits.spot.toString()).div(D18d),
    high: new Decimal(newLimits.high.toString()).div(D18d),
  }

  // D27{tok/BU}
  const newWeights = rebalance.weights.map((weightRange, i) => {
    // {wholeTok/wholeBU} = {USD/wholeShare} * {1} / {wholeBU/wholeShare} / {USD/wholeTok}
    const idealWeight = shareValue
      .mul(targetBasket[i])
      .div(actualLimits.spot)
      .div(prices[i])

    // D27{tok/BU} = {wholeTok/wholeBU} * D27 * {tok/wholeTok} / {BU/wholeBU}
    const newWeightsD27 = {
      low: bn(
        idealWeight
          .mul(rebalanceTarget.div(actualLimits.low.div(actualLimits.spot))) // add remaining delta into weight
          .mul(D27d)
          .mul(decimalScale[i])
          .div(D18d)
      ),
      spot: bn(idealWeight.mul(D27d).mul(decimalScale[i]).div(D18d)),
      high: bn(
        idealWeight
          .mul(ONE.add(delta).div(actualLimits.high.div(actualLimits.spot))) // add remaining delta into weight
          .mul(D27d)
          .mul(decimalScale[i])
          .div(D18d)
      ),
    }

    if (newWeightsD27.low < weightRange.low) {
      newWeightsD27.low = weightRange.low
    } else if (newWeightsD27.low > weightRange.high) {
      newWeightsD27.low = weightRange.high
    }

    if (newWeightsD27.spot < weightRange.low) {
      newWeightsD27.spot = weightRange.low
    } else if (newWeightsD27.spot > weightRange.high) {
      newWeightsD27.spot = weightRange.high
    }

    if (newWeightsD27.high < weightRange.low) {
      newWeightsD27.high = weightRange.low
    } else if (newWeightsD27.high > weightRange.high) {
      newWeightsD27.high = weightRange.high
    }

    return newWeightsD27
  })

  // ================================================================

  // get new prices, constrained by extremes

  // D27{USD/tok}
  const newPrices = rebalance.initialPrices.map((initialPrice, i) => {
    if (rebalance.priceControl == PriceControl.NONE) {
      return initialPrice
    }

    // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
    const pricesD27 = {
      low: bn(
        prices[i].mul(ONE.sub(priceError[i])).mul(D27d).div(decimalScale[i])
      ),
      high: bn(
        prices[i].div(ONE.sub(priceError[i])).mul(D27d).div(decimalScale[i])
      ),
    }

    // low
    if (pricesD27.low < initialPrice.low) {
      pricesD27.low = initialPrice.low
    }
    if (pricesD27.low > initialPrice.high) {
      pricesD27.low = initialPrice.high
    }

    // high
    if (pricesD27.high < initialPrice.low) {
      pricesD27.high = initialPrice.low
    }
    if (pricesD27.high > initialPrice.high) {
      pricesD27.high = initialPrice.high
    }

    if (pricesD27.low == pricesD27.high) {
      throw new Error('no price range')
    }

    return pricesD27
  })

  // ================================================================

  // calculate metrics

  // {USD} = {1} * {USD/wholeShare} * {wholeShare}
  const valueBeingTraded = rebalanceTarget
    .sub(progression)
    .mul(shareValue)
    .mul(supply)

  const surplusTokens: string[] = []
  const deficitTokens: string[] = []

  // update Decimal weightRanges
  // {wholeTok/wholeBU} = D27{tok/BU} * {BU/wholeBU} / {tok/wholeTok} / D27
  weightRanges = newWeights.map((range, i) => {
    return {
      low: new Decimal(range.low.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
      spot: new Decimal(range.spot.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
      high: new Decimal(range.high.toString())
        .mul(D18d)
        .div(decimalScale[i])
        .div(D27d),
    }
  })

  rebalance.tokens.forEach((token, i) => {
    // {wholeTok/wholeShare} = {wholeTok/wholeBU} * {wholeBU/wholeShare}
    const buyUpTo = weightRanges[i].low.mul(actualLimits.low)
    const sellDownTo = weightRanges[i].high.mul(actualLimits.high)

    if (folio[i].lt(buyUpTo)) {
      deficitTokens.push(token)
    } else if (folio[i].gt(sellDownTo)) {
      surplusTokens.push(token)
    }
  })

  return [
    {
      rebalanceNonce: rebalance.nonce,
      tokens: rebalance.tokens, // full set of tokens, not pruned to the active buy/sells
      newWeights: newWeights,
      newPrices: newPrices,
      newLimits: newLimits,
    },
    {
      round: round,
      initialProgression: initialProgression.toNumber(),
      absoluteProgression: progression.toNumber(),
      relativeProgression: relativeProgression.toNumber(),
      target: rebalanceTarget.toNumber(),
      auctionSize: valueBeingTraded.toNumber(),
      surplusTokens: surplusTokens,
      deficitTokens: deficitTokens,
    },
  ]
}
