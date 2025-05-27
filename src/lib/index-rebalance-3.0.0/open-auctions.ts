import Decimal from 'decimal.js-light'

import { bn, D27d, D9d, ONE } from './numbers'

import { Auction, BasketRange, Prices } from './types'

import { getIdealLimitsGivenBounds } from './utils'

/**
 * Get the next round of auctions needed to reach the `target`, for a tracking DTF
 *
 * Currently this method for choosing auctions is totally dumb: it creates an auction for every pair where both tokens are at least more than `precision` away
 *
 * The frontend should check to see the size of the returned auctions array, and have some stored maximum count allowable per chain, based on gas costs.
 * If the total number of auctions is greater than the max, then the UI should show that the `target` is unreachable and they must aim lower first.
 *
 * This function does not handle token ejection.
 * If token ejection is desired, the frontend needs to query folio.getRebalance(), find the right index for the token, and set auction.buyLimit = limits[i].high
 *
 * @param _supply {share}
 * @param tokens Addresses of tokens in the basket
 * @param rebalanceLimits D27{tok/share} The limit structs in the rebalance
 * @param rebalancePrices D27{USD/tok} The price structs in the rebalance
 * @param _folio D18{tok/share} Current ratio of token per share, e.g result of folio.toAssets(1e18, 0)
 * @param _decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error to use for each token during auction pricing
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param byAuctionLauncher Pass true if being launched by the auction launcher
 * @param precision {1} Precision to determine when an auction is worth launching, e.g 0.0005 means an asset must be >0.05% from its ideal weight to launch an auction
 * @param target {1} Target of this round of the rebalance; must be > than current progression. Must be 1 if not launched by the auction launcher
 * @return auctions
 */
export const getAuctionsToOpen = (
  _supply: bigint,
  tokens: string[],
  rebalanceLimits: BasketRange[],
  rebalancePrices: Prices[],
  _folio: bigint[],
  _decimals: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number,
  byAuctionLauncher: boolean = false,
  target: number = 1,
  precision: number = 0.0005
): Auction[] => {
  console.log('getAuctionsToOpen')

  const auctions: Auction[] = []

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {1}
  const priceError = _priceError.map((a) => new Decimal(a.toString()))

  // {USD/wholeShare}
  const dtfPrice = new Decimal(_dtfPrice)

  // {tok/wholeTok}
  const decimalScale = _decimals.map((a) => new Decimal(`1e${a}`))

  // ================================================================

  // get the ideal spot limits, taking into account low/high bounds
  // {wholeTok/wholeShare}
  const spotLimits = getIdealLimitsGivenBounds(
    rebalanceLimits,
    _decimals,
    _prices,
    _dtfPrice,
    byAuctionLauncher
  )

  // ================================================================

  // verify dtf is now worth about the dtfPrice
  // it's technically possible to reach this case if prices have moved SO much that no allocation of the limits changes anything
  const currentDTFPrice = spotLimits
    .map((spotLimit: Decimal, i: number) => spotLimit.mul(prices[i]))
    .reduce((a, b) => a.add(b))

  console.log(
    'currentDTFPrice',
    currentDTFPrice.toString(),
    dtfPrice.toString()
  )

  // error should be less than 1-9
  if (
    currentDTFPrice.lt(dtfPrice.sub(new Decimal('1e-9'))) ||
    currentDTFPrice.gt(dtfPrice.add(new Decimal('1e-9')))
  ) {
    console.log(currentDTFPrice.toString(), dtfPrice.toString())
    throw new Error('prices have moved too much since rebalance construction')
  }

  // ================================================================

  // split assets into surpluses and deficits

  // {wholeTok/wholeShare} = D18{tok/share} * {share/wholeShare} / {tok/wholeTok} / D18
  const folio = _folio.map((c: bigint, i: number) =>
    new Decimal(c.toString()).div(decimalScale[i])
  )

  console.log(
    'folio',
    folio.map((a) => a.toString())
  )

  const surplusIndices: number[] = []
  const deficitIndices: number[] = []

  // split indices into surpluses and deficits, ignoring differences below precision
  for (let i = 0; i < tokens.length; i++) {
    const limitPrecision = spotLimits[i].mul(precision)

    // define deficit relative to the target (can be < 100%) and the surplus relative to 100%
    if (folio[i].lt(spotLimits[i].mul(target).sub(limitPrecision))) {
      deficitIndices.push(i)
    } else if (folio[i].gt(spotLimits[i].add(limitPrecision))) {
      surplusIndices.push(i)
    }
  }

  console.log('surplusIndices', surplusIndices)
  console.log('deficitIndices', deficitIndices)

  // ================================================================

  // make auctions out of every pair of surplus and deficit

  for (let i = 0; i < surplusIndices.length; i++) {
    const x = surplusIndices[i]

    for (let j = 0; j < deficitIndices.length; j++) {
      const y = deficitIndices[j]

      console.log('--------------')
      console.log('spotLimits[x]', spotLimits[x].toString())
      console.log('spotLimits[y]', spotLimits[y].toString())

      // D27{tok/share} = D27 * {wholeTok/wholeShare} * {tok/wholeTok} / {share/wholeShare}
      const sellLimit = bn(D9d.mul(spotLimits[x]).mul(decimalScale[x]))
      const buyLimit = bn(
        D9d.mul(spotLimits[y]).mul(decimalScale[y]).mul(target)
      )
      // aim buyLimit lower by the target

      // {USD/wholeSellTok}
      const lowSellPrice = prices[x].mul(ONE.sub(priceError[x]))
      const highSellPrice = prices[x].div(ONE.sub(priceError[x]))

      // {USD/wholeBuyTok}
      const lowBuyPrice = prices[y].mul(ONE.sub(priceError[y]))
      const highBuyPrice = prices[y].div(ONE.sub(priceError[y]))

      // {wholeBuyTok/wholeSellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok}
      let startPrice = highSellPrice.div(lowBuyPrice)
      let endPrice = lowSellPrice.div(highBuyPrice)

      // {USD/wholeSellTok} = D27{USD/tok} * {tok/wholeSellTok} / D27
      const lowSellRebalancePrice = new Decimal(
        rebalancePrices[x].low.toString()
      )
        .mul(decimalScale[x])
        .div(D27d)

      // {USD/wholeSellTok} = D27{USD/tok} * {tok/wholeSellTok} / D27
      const highSellRebalancePrice = new Decimal(
        rebalancePrices[x].high.toString()
      )
        .mul(decimalScale[x])
        .div(D27d)

      // {USD/wholeBuyTok} = D27{USD/tok} * {tok/wholeBuyTok} / D27
      const lowBuyRebalancePrice = new Decimal(
        rebalancePrices[y].low.toString()
      )
        .mul(decimalScale[y])
        .div(D27d)

      // {USD/wholeBuyTok} = D27{USD/tok} * {tok/wholeBuyTok} / D27
      const highBuyRebalancePrice = new Decimal(
        rebalancePrices[y].high.toString()
      )
        .mul(decimalScale[y])
        .div(D27d)

      // {wholeBuyTok/wholeSellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok}
      const ceilingPrice = highSellRebalancePrice.div(lowBuyRebalancePrice)
      const floorPrice = lowSellRebalancePrice.div(highBuyRebalancePrice)

      console.log('ceilingPrice', ceilingPrice.toString())
      console.log('startPrice', startPrice.toString())

      if (startPrice.lt(ceilingPrice)) {
        startPrice = ceilingPrice
      }

      auctions.push({
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
      })
    }
  }

  // order auctions by size
  auctions.sort((a, b) => {
    // {USD/wholeShare}
    const getDelta = (a: Auction) => {
      const x = tokens.indexOf(a.sell)
      const y = tokens.indexOf(a.buy)

      // {wholeSellTok/wholeShare}
      const surplus = folio[x].sub(spotLimits[x].mul(target))

      // {wholeBuyTok/wholeShare}
      const deficit = spotLimits[y].mul(target).sub(folio[y])

      // {USD/wholeShare} = {wholeSellTok/wholeShare} * {USD/wholeSellTok}
      return Math.min(
        surplus.mul(prices[x]).toNumber(),
        deficit.mul(prices[y]).toNumber()
      )
    }

    // {USD/wholeShare}
    return getDelta(a) - getDelta(b)
  })

  console.log(auctions.length, auctions)

  return auctions
}
