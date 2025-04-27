import { Decimal } from 'decimal.js-light'

import { bn, D18d, D27d, D9d, ONE, ZERO } from './numbers'

import { Auction, BasketRange, Prices } from './types'

/**
 * Get the next round of auctions needed to reach the `target`, for a tracking DTF
 *
 * Currently this method for choosing auctions is totally dumb: it creates an auction for every pair where both tokens are at least more than `precision` away
 *
 * The frontend should check to see the size of the returned auctions array, and have some stored maximum count allowable per chain, based on gas costs.
 * If the total number of auctions is greater than the max, then the UI should show that the `target` is unreachable and they must aim lower first.
 *
 * @param _supply {share}
 * @param tokens Addresses of tokens in the basket
 * @param rebalanceLimits D27{tok/share} The limit structs in the rebalance
 * @param rebalancePrices D27{USD/tok} The price structs in the rebalance
 * @param currentBasket D18{tok/share} Current ratio of token per share, e.g result of folio.toAssets(1e18, 0)
 * @param _decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param precision {1} Precision to determine when an auction is worth launching, e.g 0.0005 means an asset must be >0.05% from its ideal weight to launch an auction
 * @param byAuctionLauncher Pass true if being launched by the auction launcher
 * @param target {1} Target of this round of the rebalance; must be > than current progression. Must be 1 if not launched by the auction launcher
 * @return auctions
 */
export const getAuctions = (
  _supply: bigint,
  tokens: string[],
  rebalanceLimits: BasketRange[],
  rebalancePrices: Prices[],
  _currentBasket: bigint[],
  _decimals: bigint[],
  _prices: number[],
  _dtfPrice: number,
  precision: number = 0.0005,
  byAuctionLauncher: boolean = false,
  target: number = 1
): Auction[][] => {
  const auctions: Auction[][] = []

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {USD/wholeShare}
  const dtfPrice = new Decimal(_dtfPrice)

  // {tok/wholeTok}
  const decimalScale = _decimals.map((a) => new Decimal(`1e${a}`))

  // ================================================================

  // {wholeTok/wholeShare} = D27{tok/share} * {share/wholeShare} / {tok/wholeTok} / D27
  const spotLimits = rebalanceLimits.map((limit: BasketRange, i: number) =>
    new Decimal(limit.spot.toString()).mul(D18d).div(decimalScale[i]).div(D27d)
  )

  // if by auction launcher: re-norm spot limits as much as possible
  if (byAuctionLauncher) {
    // {USD/wholeShare}
    let dtfPriceLockedIn = ZERO

    const indicesLockedIn: number[] = []

    for (let i = 0; i < tokens.length; i++) {
      // compute dtf price at current spot limits
      // {USD/wholeShare} = {wholeTok/wholeShare} * {USD/wholeTok}
      const currentDTFPrice = spotLimits
        .map((spotLimit: Decimal, i: number) => spotLimit.mul(prices[i]))
        .reduce((a, b) => a.add(b))

      // {1} = {USD/wholeShare} / {USD/wholeShare}
      let normalizer = dtfPrice.div(currentDTFPrice)

      // account for portion of dtf price already tracked, due to being locked in at the lows/highs
      if (currentDTFPrice.gte(dtfPrice)) {
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
          // {USD/wholeShare} = {USD/wholeShare} + {wholeTok/wholeShare} * {USD/wholeTok}
          dtfPriceLockedIn = dtfPriceLockedIn.plus(lowLimit.mul(prices[i]))
          spotLimits[i] = lowLimit
          indicesLockedIn.push(i)
        } else if (idealLimit.gte(highLimit) && !indicesLockedIn.includes(i)) {
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

  // ================================================================

  // verify dtf is now worth about the dtfPrice
  // it's technically possible to reach this case if prices have moved SO much that no allocation of the limits changes anything
  const currentDTFPrice = spotLimits
    .map((spotLimit: Decimal, i: number) => spotLimit.mul(prices[i]))
    .reduce((a, b) => a.add(b))

  // error should be less than 1-9
  if (
    currentDTFPrice.lt(dtfPrice.sub(new Decimal('1e-9'))) ||
    currentDTFPrice.gt(dtfPrice.add(new Decimal('1e-9')))
  ) {
    console.log(currentDTFPrice, dtfPrice)
    throw new Error('prices have moved too much since rebalance construction')
  }

  // ================================================================

  // split assets into surpluses and deficits

  // {wholeTok/wholeShare} = D18{tok/share} * {share/wholeShare} / {tok/wholeTok} / D18
  const currentBasket = _currentBasket.map((c: bigint, i: number) =>
    new Decimal(c.toString()).div(decimalScale[i])
  )

  const surplusIndices: number[] = []
  const deficitIndices: number[] = []

  // split indices into surpluses and deficits, ignoring differences below precision
  for (let i = 0; i < tokens.length; i++) {
    const limitPrecision = spotLimits[i].mul(precision)

    // define deficit relative to the target (can be < 100%) and the surplus relative to 100%
    if (currentBasket[i].lt(spotLimits[i].mul(target).sub(limitPrecision))) {
      deficitIndices.push(i)
    } else if (currentBasket[i].gt(spotLimits[i].add(limitPrecision))) {
      surplusIndices.push(i)
    }
  }

  // ================================================================

  // make auctions out of every pair of surplus and deficit

  // {UoA/wholeTok} = D27{UoA/tok} * {tok/wholeTok}  / D27
  const lowRebalancePrices = rebalancePrices.map(
    (priceRange: Prices, i: number) =>
      new Decimal(priceRange.low.toString()).mul(decimalScale[i]).div(D27d)
  )

  // {UoA/wholeTok} = D27{UoA/tok} * {tok/wholeTok}  / D27
  const highRebalancePrices = rebalancePrices.map(
    (priceRange: Prices, i: number) =>
      new Decimal(priceRange.high.toString()).mul(decimalScale[i]).div(D27d)
  )

  for (let i = 0; i < surplusIndices.length; i++) {
    const x = surplusIndices[i]

    for (let j = 0; j < deficitIndices.length; j++) {
      const y = deficitIndices[j]

      // D27{tok/share} = D27 * {wholeTok/wholeShare} * {tok/wholeTok} / {share/wholeShare}
      const sellLimit = bn(D9d.mul(spotLimits[x]).mul(decimalScale[x]))
      const buyLimit = bn(
        D9d.mul(spotLimits[y]).mul(decimalScale[y]).mul(target)
      )
      // aim buyLimit lower by the target

      // {wholeBuyTok/wholeSellTok} = D27 * {USD/wholeSellTok} / {USD/wholeBuyTok}
      const startPrice = D27d.mul(highRebalancePrices[x]).div(
        lowRebalancePrices[y]
      )
      const endPrice = D27d.mul(lowRebalancePrices[x]).div(
        highRebalancePrices[y]
      )

      auctions.push([
        {
          sell: tokens[x],
          buy: tokens[y],
          sellLimit: sellLimit,
          buyLimit: buyLimit,

          // D27{buyTok/sellTok} = D27 * {wholeBuyTok/wholeSellTok} * {buyTok/wholeBuyTok} / {sellTok/wholeSellTok}
          startPrice: bn(
            D27d.mul(startPrice).mul(decimalScale[y]).div(decimalScale[x])
          ),
          endPrice: bn(
            D27d.mul(endPrice).mul(decimalScale[y]).div(decimalScale[x])
          ),
        },
      ])
    }
  }

  console.log(auctions.length, auctions)

  return auctions
}
