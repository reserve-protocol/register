import { Decimal } from 'decimal.js-light'

import { Auction } from './types'
import { bn, D18d, D27d, ONE, TWO, ZERO } from './numbers'
import { makeAuction } from './utils'

/**
 * Get the set of auctions required to reach the target basket
 *
 * Warnings:
 *   - Breakup large auctions into smaller auctions in advance of using this algo; a large Folio may have to use this
 *     algo multiple times to rebalance gradually to avoid transacting too much volume in any one auction. Basically,
 *     not trading too much is a responsibility of the user of this algorithm.
 *
 * @param _supply {share}
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param _currentBasket D18{1} Current balances
 * @param _targetBasket D18{1} Ideal basket
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error, pass 1 to fully defer to auction launcher
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param tolerance D18{1} Tolerance for rebalancing to determine when to tolerance auction or not, default 0.1%
 */
export const getAuctions = (
  _supply: bigint,
  tokens: string[],
  decimals: bigint[],
  _currentBasket: bigint[],
  _targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number,
  _tolerance: bigint = 10n ** 14n // 0.01%
): Auction[] => {
  console.log(
    'getAuctions()',
    _supply,
    tokens,
    decimals,
    _currentBasket,
    _targetBasket,
    _prices,
    _priceError,
    _dtfPrice,
    _tolerance
  )

  const auctions: Auction[] = []

  // convert price number inputs to bigints

  // {wholeShare}
  const supply = new Decimal(_supply.toString()).div(D18d)

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {USD/wholeShare}
  const dtfPrice = new Decimal(_dtfPrice)

  // {1} = D18{1} / D18
  const currentBasket = _currentBasket.map((a) =>
    new Decimal(a.toString()).div(D18d)
  )

  // {1} = D18{1} / D18
  const targetBasket = _targetBasket.map((a) =>
    new Decimal(a.toString()).div(D18d)
  )

  // {1}
  const priceError = _priceError.map((a) => new Decimal(a))

  const tolerance = new Decimal(_tolerance.toString()).div(D18d)

  console.log(
    '--------------------------------------------------------------------------------'
  )

  // {USD} = {USD/wholeShare} * {wholeShare}
  const sharesValue = dtfPrice.mul(supply)

  console.log('sharesValue', sharesValue)

  // queue up auctions until there are no more auctions-to-make greater than tolerance in size

  while (true) {
    if (auctions.length > tokens.length - 1) {
      throw new Error('something has gone very wrong')
    }

    // indices
    let x = tokens.length // sell index
    let y = tokens.length // buy index

    // {USD}
    let biggestSurplus = ZERO
    let biggestDeficit = ZERO

    for (let i = 0; i < tokens.length; i++) {
      if (
        currentBasket[i].gt(targetBasket[i]) &&
        currentBasket[i].minus(targetBasket[i]).gt(tolerance)
      ) {
        // {USD} = {1} * {USD}
        const surplus = currentBasket[i].minus(targetBasket[i]).mul(sharesValue)
        if (surplus.gt(biggestSurplus)) {
          biggestSurplus = surplus
          x = i
        }
      } else if (
        currentBasket[i].lt(targetBasket[i]) &&
        targetBasket[i].minus(currentBasket[i]).gt(tolerance)
      ) {
        // {USD} = {1} * {USD}
        const deficit = targetBasket[i].minus(currentBasket[i]).mul(sharesValue)
        if (deficit.gt(biggestDeficit)) {
          biggestDeficit = deficit
          y = i
        }
      }
    }

    // if we don't find any more auctions, we're done
    if (x == tokens.length || y == tokens.length) {
      return auctions
    }

    // simulate swap and update currentBasket

    // {USD}
    const maxAuction = biggestDeficit.lt(biggestSurplus)
      ? biggestDeficit
      : biggestSurplus
    console.log('biggestSurplus', biggestSurplus)
    console.log('biggestDeficit', biggestDeficit)

    // {1} = {USD} / {USD}
    const backingAuctioned = maxAuction.div(sharesValue)

    console.log('backingAuctioned', backingAuctioned)

    // {1}
    currentBasket[x] = currentBasket[x].minus(backingAuctioned)
    currentBasket[y] = currentBasket[y].plus(backingAuctioned)

    // {1}
    let avgPriceError = priceError[x].plus(priceError[y]).div(TWO)
    if (priceError[x].gt(ONE) || priceError[y].gt(ONE)) {
      throw new Error('price error too large')
    }

    // {wholeTok/wholeShare} = {1} * {USD} / {USD/wholeTok} / {wholeShare}
    const sellLimit = targetBasket[x]
      .mul(sharesValue)
      .div(prices[x])
      .div(supply)
    const buyLimit = targetBasket[y].mul(sharesValue).div(prices[y]).div(supply)

    // {wholeBuyTok/wholeSellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok}
    const price = prices[x].div(prices[y])

    // {wholeBuyTok/wholeSellTok} = {wholeBuyTok/wholeSellTok} / {1}
    const startPrice = avgPriceError.eq(ONE)
      ? ZERO
      : price.div(ONE.minus(avgPriceError))
    const endPrice = avgPriceError.eq(ONE)
      ? ZERO
      : price.mul(ONE.minus(avgPriceError))

    // D27{tok/share} = {wholeTok/wholeShare} * D27 * {tok/wholeTok} / {share/wholeShare}
    let bnSellLimit = bn(
      sellLimit
        .mul(D27d)
        .mul(new Decimal(`1e${decimals[x]}`))
        .div(D18d)
    )

    // D27{tok/share} = {wholeTok/wholeShare} * D27 * {tok/wholeTok} / {share/wholeShare}
    let bnBuyLimit = bn(
      buyLimit
        .mul(D27d)
        .mul(new Decimal(`1e${decimals[y]}`))
        .div(D18d)
    )

    if (bnSellLimit >= 10n ** 54n || bnBuyLimit == 0n) {
      throw new Error('invalid limits')
    }
    if (bnBuyLimit >= 10n ** 54n) {
      bnBuyLimit = 10n ** 54n
    }
    if (bnSellLimit == 0n && biggestSurplus >= biggestDeficit) {
      bnBuyLimit = 10n ** 54n
    }

    // add auction into set
    auctions.push(
      makeAuction(
        tokens[x],
        tokens[y],
        bnSellLimit,
        bnBuyLimit,
        // D27{buyTok/sellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok} * D27 * {buyTok/wholeBuyTok} / {sellTok/wholeSellTok}
        bn(
          startPrice
            .mul(D27d)
            .mul(new Decimal(`1e${decimals[y]}`))
            .div(new Decimal(`1e${decimals[x]}`))
        ),
        // D27{buyTok/sellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok} * D27 * {buyTok/wholeBuyTok} / {sellTok/wholeSellTok}
        bn(
          endPrice
            .mul(D27d)
            .mul(new Decimal(`1e${decimals[y]}`))
            .div(new Decimal(`1e${decimals[x]}`))
        ),
        bn(avgPriceError.mul(D18d))
      )
    )

    // do not remove console.logs
    console.log('sellLimit', auctions[auctions.length - 1].sellLimit.spot)
    console.log('buyLimit', auctions[auctions.length - 1].buyLimit.spot)
    console.log('startPrice', auctions[auctions.length - 1].prices.start)
    console.log('endPrice', auctions[auctions.length - 1].prices.end)
    console.log('currentBasket', currentBasket)
  }
}
