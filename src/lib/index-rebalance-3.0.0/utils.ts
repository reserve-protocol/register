import Decimal from 'decimal.js-light'

import { D18d, D27d, D18n, ONE, ZERO } from './numbers'

import { BasketRange } from './types'

/**
 * @param bals {tok} Current balances
 * @param decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @returns D18{1} Current basket, total will be around 1e18 but not exactly
 */
export const getCurrentBasketDistribution = (
  bals: bigint[],
  decimals: bigint[],
  _prices: number[]
): bigint[] => {
  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    BigInt(
      new Decimal(a)
        .mul(D27d)
        .div(new Decimal(`1e${decimals[i]}`))
        .toFixed(0)
    )
  )

  // D27{USD} = {tok} * D27{USD/tok}
  const values = bals.map((bal, i) => bal * prices[i])

  // D27{USD}
  const total = values.reduce((a, b) => a + b)

  // D18{1} = D27{USD} * D18 / D27{USD}
  return values.map((amt) => (amt * D18n) / total)
}

/**
 * Get the ideal set of limits given where the current prices are, accounting for low/high bounds
 *
 * @param tokens Addresses of tokens in the basket
 * @param rebalanceLimits D27{tok/share} The limit structs in the rebalance
 * @param currentBasket D18{tok/share} Current ratio of token per share, e.g result of folio.toAssets(1e18, 0)
 * @param _decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param byAuctionLauncher Pass true if being launched by the auction launcher
 * @return spot limits {wholeTok/wholeShare}
 */
export const getIdealLimitsGivenBounds = (
  rebalanceLimits: BasketRange[],
  _decimals: bigint[],
  _prices: number[],
  _dtfPrice: number,
  byAuctionLauncher: boolean = false
): Decimal[] => {
  console.log('getIdealLimitsGivenBounds')

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {USD/wholeShare}
  const dtfPrice = new Decimal(_dtfPrice)

  // {tok/wholeTok}
  const decimalScale = _decimals.map((a) => new Decimal(`1e${a}`))

  console.log('dtfPrice', dtfPrice.toString())

  // ================================================================

  // {wholeTok/wholeShare} = D27{tok/share} * {share/wholeShare} / {tok/wholeTok} / D27
  const spotLimits = rebalanceLimits.map((limit: BasketRange, i: number) =>
    new Decimal(limit.spot.toString()).mul(D18d).div(decimalScale[i]).div(D27d)
  )

  console.log(
    'spotLimits',
    spotLimits.map((a) => a.toString())
  )

  // if by auction launcher: re-norm spot limits as much as possible
  if (byAuctionLauncher) {
    // {USD/wholeShare}
    let dtfPriceLockedIn = ZERO

    const indicesLockedIn: number[] = []

    for (let i = 0; i < spotLimits.length; i++) {
      // compute dtf price at current spot limits
      // {USD/wholeShare} = {wholeTok/wholeShare} * {USD/wholeTok}
      const currentDTFPrice = spotLimits
        .map((spotLimit: Decimal, i: number) => spotLimit.mul(prices[i]))
        .reduce((a, b) => a.add(b))

      console.log('dtfPriceLockedIn', dtfPriceLockedIn.toString())
      console.log('currentDTFPrice', currentDTFPrice.toString())

      // {1} = {USD/wholeShare} / {USD/wholeShare}
      let normalizer = dtfPrice.div(currentDTFPrice)

      console.log('normalizer', normalizer.toString())

      if (currentDTFPrice.eq(dtfPrice)) {
        console.log('finished normalizing early')
        break
      }
      // account for portion of dtf price already tracked, due to being locked in at the lows/highs
      else if (currentDTFPrice.gt(dtfPrice)) {
        // shrinking case

        // {wholeTok/wholeShare} = {wholeTok/wholeShare} * ({1} - {USD/wholeShare} / {USD/wholeShare})
        normalizer = normalizer.mul(ONE.sub(dtfPriceLockedIn.div(dtfPrice)))
      } else {
        // growing case

        // {wholeTok/wholeShare} = {wholeTok/wholeShare} * ({1} - {1} / {USD/wholeShare} / {USD/wholeShare})
        normalizer = normalizer.div(ONE.sub(dtfPriceLockedIn.div(dtfPrice)))
      }

      // cap by low/high bounds
      for (let i = 0; i < spotLimits.length; i++) {
        // {wholeTok/wholeShare} = {wholeTok/wholeShare} * {1}
        const idealLimit = spotLimits[i].mul(normalizer)

        // {wholeTok/wholeShare} = D27{tok/share} * {share/wholeShare} / {tok/wholeTok} / D27
        const lowLimit = new Decimal(rebalanceLimits[i].low.toString())
          .mul(D18d)
          .div(decimalScale[i])
          .div(D27d)

        // {wholeTok/wholeShare} = D27{tok/share} * {share/wholeShare} / {tok/wholeTok} / D27
        const highLimit = new Decimal(rebalanceLimits[i].high.toString())
          .mul(D18d)
          .div(decimalScale[i])
          .div(D27d)

        if (idealLimit.lte(lowLimit) && !indicesLockedIn.includes(i)) {
          console.log('locked in at low limit')

          // {USD/wholeShare} = {USD/wholeShare} + {wholeTok/wholeShare} * {USD/wholeTok}
          dtfPriceLockedIn = dtfPriceLockedIn.plus(lowLimit.mul(prices[i]))
          spotLimits[i] = lowLimit
          indicesLockedIn.push(i)
        } else if (idealLimit.gte(highLimit) && !indicesLockedIn.includes(i)) {
          console.log('locked in at high limit')

          // {USD/wholeShare} = {USD/wholeShare} + {wholeTok/wholeShare} * {USD/wholeTok}
          dtfPriceLockedIn = dtfPriceLockedIn.plus(highLimit.mul(prices[i]))
          spotLimits[i] = highLimit
          indicesLockedIn.push(i)
        } else {
          spotLimits[i] = idealLimit
        }
      }
    }
  }

  console.log(
    'ideal spotLimits',
    spotLimits.map((a) => a.toString())
  )

  return spotLimits
}
