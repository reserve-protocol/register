import Decimal from 'decimal.js-light'

import { bn, D18d, D18n, D27d, ONE, ZERO } from './numbers'

import { PriceRange, Rebalance, RebalanceLimits, WeightRange } from './types'

// All the args needed to call `folio.openAuction()`
export interface OpenAuctionArgs {
  rebalanceNonce: bigint
  tokens: string[]
  newWeights: bigint[]
  newPrices: PriceRange[]
  newLimits: RebalanceLimits
}

/**
 * Get the values needed to call `folio.openAuction()` as the AUCTION_LAUNCHER
 *
 * Non-AUCTION_LAUNCHERs should use `folio.openAuctionUnrestricted()`
 *
 * @param rebalance The result of calling folio.getRebalance()
 * @param _initialFolio D18{tok/share} Initial balances per share, e.g result of folio.toAssets(1e18, 0) at time rebalance was first proposed
 * @param _targetBasket D18{1} The target basket to rebalance into
 * @param _folio D18{tok/share} Current ratio of token per share, e.g result of folio.toAssets(1e18, 0)
 * @param _decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error to use for each token during auction pricing; should be smaller than price error during startRebalance
 * @param _finalStageAt {1} The % rebalanced from the initial Folio to determine when is the final stage of the rebalance
 */
export const getOpenAuction = (
  rebalance: Rebalance,
  _initialFolio: bigint[] = [],
  _targetBasket: bigint[] = [],
  _folio: bigint[],
  _decimals: bigint[],
  _prices: number[],
  _priceError: number[],
  _finalStageAt: number = 0.9
): OpenAuctionArgs => {
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

  if (_targetBasket.reduce((a, b) => a + b) != D18n) {
    throw new Error('_targetBasket does not sum to 1e18')
  }

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
  const weightRanges = rebalance.weights.map(
    (range: WeightRange, i: number) => {
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
    }
  )

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

  // calculate buyTarget

  let buyTarget = ONE

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
  const progression = folio
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

  // {1} = {1} / {1}
  const relativeProgression = progression
    .sub(initialProgression)
    .div(ONE.sub(initialProgression))

  // make it an eject auction if there is 1 bps or more of value to eject
  if (portionBeingEjected.gte(1e-4)) {
    buyTarget = progression.add(portionBeingEjected.mul(1.5)) // set buyTarget to 50% more than needed, to ensure ejection completes
    if (buyTarget.gt(ONE)) {
      buyTarget = ONE
    }
  } else if (relativeProgression.lt(finalStageAt.sub(0.02))) {
    // wiggle room to prevent having to re-run an auction at the same stage after price movement
    buyTarget = finalStageAt
  }

  // ================================================================

  // get new limits, constrained by extremes

  // {wholeBU/wholeShare} = {USD/wholeShare} / {USD/wholeBU}
  const idealSpotLimit = shareValue.div(buValue)

  // {BU/share} = {wholeBU/wholeShare} * {1}
  const limitDelta = idealSpotLimit.mul(ONE.sub(buyTarget))

  // D18{BU/share} = {wholeBU/wholeShare} * D18 * {1}
  const newLimits = {
    low: bn(idealSpotLimit.sub(limitDelta).mul(D18d)),
    spot: bn(idealSpotLimit.mul(D18d)),
    high: bn(idealSpotLimit.add(limitDelta).mul(D18d)),
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
  const actualSpotLimit = new Decimal(newLimits.spot.toString()).div(D18d)

  // D27{tok/BU}
  const newWeights = rebalance.weights.map((weightRange, i) => {
    // {wholeTok/wholeBU} = {USD/wholeShare} * {1} / {wholeBU/wholeShare} / {USD/wholeTok}
    const idealSpotWeight = shareValue
      .mul(targetBasket[i])
      .div(actualSpotLimit)
      .div(prices[i])

    // D27{tok/BU} = {wholeTok/wholeBU} * D27 * {tok/wholeTok} / {BU/wholeBU}
    let idealSpotWeightD27 = bn(
      idealSpotWeight.mul(D27d).mul(decimalScale[i]).div(D18d)
    )

    if (idealSpotWeightD27 < weightRange.low) {
      idealSpotWeightD27 = weightRange.low
    } else if (idealSpotWeightD27 > weightRange.high) {
      idealSpotWeightD27 = weightRange.high
    }

    return idealSpotWeightD27
  })

  // ================================================================

  // get new prices, constrained by extremes

  // D27{USD/tok}
  const newPrices = rebalance.initialPrices.map((initialPrice, i) => {
    if (!rebalance.priceControl) {
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

  return {
    rebalanceNonce: rebalance.nonce,
    tokens: rebalance.tokens, // full set of tokens, not pruned to the active buy/sells
    newWeights: newWeights,
    newPrices: newPrices,
    newLimits: newLimits,
  }
}
