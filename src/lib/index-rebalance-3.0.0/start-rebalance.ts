import Decimal from 'decimal.js-light'

import { bn, D18d, D27d, ONE } from './numbers'

import { BasketRange, Prices } from './types'

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
 * @param _priceError {1} Price error, pass 1 to fully defer to auction launcher
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @return newLimits D27{tok/share}
 * @return newPrices D27{USD/tok}
 */
export const getStartRebalance = (
  _supply: bigint,
  tokens: string[],
  decimals: bigint[],
  _targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number
): [BasketRange[], Prices[]] => {
  const newLimits: BasketRange[] = []
  const newPrices: Prices[] = []

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

  for (let i = 0; i < tokens.length; i++) {
    // === newLimits ===

    console.log('------------------------------------------------------------')
    console.log('token', tokens[i])

    // {wholeTok/wholeShare} = {1} * {USD/wholeShare} / {USD/wholeTok}
    const spot = targetBasket[i].mul(dtfPrice).div(prices[i])

    console.log('limit.spot', spot.toString())

    // D27{tok/share}{wholeShare/wholeTok} = D27 * {tok/wholeTok} / {share/wholeShare}
    const limitMultiplier = D27d.mul(new Decimal(`1e${decimals[i]}`)).div(D18d)

    if (priceError[i].gte(ONE)) {
      // D27{tok/share} = {wholeTok/wholeShare} * D27{tok/share}{wholeShare/wholeTok}
      newLimits.push({
        spot: bn(spot.mul(limitMultiplier)),
        low: bn('1'),
        high: bn('1e54'),
      })
    } else {
      // {wholeTok/wholeShare} = {wholeTok/wholeShare} / {1}
      const low = spot.mul(ONE.sub(priceError[i]))
      const high = spot.div(ONE.sub(priceError[i]))

      console.log('limit.low', low.toString())
      console.log('limit.high', high.toString())

      // D27{tok/share} = {wholeTok/wholeShare} * D27{tok/share}{wholeShare/wholeTok}
      newLimits.push({
        spot: bn(spot.mul(limitMultiplier)),
        low: bn(low.mul(limitMultiplier)),
        high: bn(high.mul(limitMultiplier)),
      })
    }

    // === newPrices ===

    // D27{wholeTok/tok} = D27 / {tok/wholeTok}
    const priceMultiplier = D27d.div(new Decimal(`1e${decimals[i]}`))

    if (priceError[i].gte(ONE)) {
      console.log('deferring to price curator')

      newPrices.push({
        low: bn('0'),
        high: bn('0'),
      })
    } else {
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
  }

  return [newLimits, newPrices]
}
