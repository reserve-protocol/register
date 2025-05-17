import Decimal from 'decimal.js-light'

import { bn, D18d, D27d, ONE } from './numbers'

import {
  WeightControl,
  PriceRange,
  RebalanceLimits,
  WeightRange,
} from './types'

// Partial set of the args needed to call `startRebalance()`
export interface StartRebalanceArgsPartial {
  // tokens: string[]
  weights: WeightRange[]
  prices: PriceRange[]
  limits: RebalanceLimits
  // auctionLauncherWindow: bigint
  // ttl: bigint
}

/**
 * Get the arguments needed to call startRebalance
 *
 * The `tokens` argument should be paired with the two return values and passed to `startRebalance()`
 *
 * @param _supply {share}
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param _targetBasket D18{1} Ideal basket
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error per token to use in the rebalanc; should be larger than price error during openAuction
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param weightControl WeightControl.NONE or WeightControl.SOME
 */
export const getStartRebalance = (
  _supply: bigint,
  tokens: string[],
  decimals: bigint[],
  _targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number,
  weightControl: WeightControl
): StartRebalanceArgsPartial => {
  // convert price number inputs to bigints

  // {wholeShare}
  const supply = new Decimal(_supply.toString()).div(D18d)

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a.toString()))

  // {USD/wholeShare}
  const dtfPrice = new Decimal(_dtfPrice)

  // {1} = D18{1} / D18
  const targetBasket = _targetBasket.map((a) =>
    new Decimal(a.toString()).div(D18d)
  )

  // {1}
  const priceError = _priceError.map((a) => new Decimal(a.toString()))

  // {USD} = {USD/wholeShare} * {wholeShare}
  const sharesValue = dtfPrice.mul(supply)

  console.log('sharesValue', sharesValue.toString())

  // ================================================================

  const newWeights: WeightRange[] = []
  const newPrices: PriceRange[] = []
  const newLimits: RebalanceLimits = {
    low: bn('1e18'),
    spot: bn('1e18'),
    high: bn('1e18'),
  }

  // ================================================================

  for (let i = 0; i < tokens.length; i++) {
    if (priceError[i].gte(ONE)) {
      throw new Error('cannot defer prices')
    }

    // === newWeights ===

    console.log('------------------------------------------------------------')
    console.log('token', tokens[i])

    // {wholeTok/wholeShare} = {1} * {USD/wholeShare} / {USD/wholeTok}
    const spotWeight = targetBasket[i].mul(dtfPrice).div(prices[i])

    console.log('weights.spot', spotWeight.toString())

    // D27{tok/share}{wholeShare/wholeTok} = D27 * {tok/wholeTok} / {share/wholeShare}
    const limitMultiplier = D27d.mul(new Decimal(`1e${decimals[i]}`)).div(D18d)

    if (weightControl == WeightControl.NONE) {
      // D27{tok/BU} = {wholeTok/wholeShare} * D27{tok/share}{wholeShare/wholeTok} / {BU/share}
      newWeights.push({
        low: bn(spotWeight.mul(limitMultiplier)),
        spot: bn(spotWeight.mul(limitMultiplier)),
        high: bn(spotWeight.mul(limitMultiplier)),
      })
    } else {
      // NATIVE case

      // {wholeTok/wholeShare} = {wholeTok/wholeShare} / {1}
      const lowWeight = spotWeight.mul(ONE.sub(priceError[i]))
      const highWeight = spotWeight.div(ONE.sub(priceError[i]))

      console.log('weights.low', lowWeight.toString())
      console.log('weights.high', highWeight.toString())

      // D27{tok/share} = {wholeTok/wholeShare} * D27{tok/share}{wholeShare/wholeTok} / {BU/share}
      newWeights.push({
        low: bn(lowWeight.mul(limitMultiplier)),
        spot: bn(spotWeight.mul(limitMultiplier)),
        high: bn(highWeight.mul(limitMultiplier)),
      })
    }

    // === newPrices ===

    // D27{wholeTok/tok} = D27 / {tok/wholeTok}
    const priceMultiplier = D27d.div(new Decimal(`1e${decimals[i]}`))

    // {USD/wholeTok} = {USD/wholeTok} * {1}
    const lowPrice = prices[i].mul(ONE.sub(priceError[i]))
    const highPrice = prices[i].div(ONE.sub(priceError[i]))

    console.log('price.low', lowPrice.toString())
    console.log('price.high', highPrice.toString())

    // D27{USD/tok} = {USD/wholeTok} * D27{wholeTok/tok}
    newPrices.push({
      low: bn(lowPrice.mul(priceMultiplier)),
      high: bn(highPrice.mul(priceMultiplier)),
    })
  }

  // update low/high for tracking DTFs
  if (weightControl == WeightControl.NONE) {
    // sum of dot product of targetBasket and priceError
    const totalPortion = targetBasket
      .map((portion: Decimal, i: number) => portion.mul(priceError[i]))
      .reduce((a: Decimal, b: Decimal) => a.add(b))

    if (totalPortion.gte(ONE)) {
      throw new Error('totalPortion > 1')
    }

    // D18{BU/share} = {1} * D18 * {BU/share}
    newLimits.low = bn(ONE.sub(totalPortion).mul(D18d))
    newLimits.high = bn(ONE.div(ONE.sub(totalPortion)).mul(D18d))
  }

  return {
    weights: newWeights,
    prices: newPrices,
    limits: newLimits,
  }
}
