import { Decimal } from 'decimal.js-light'

import { D18d, D27d, ONE, TWO } from './numbers'
import { Auction } from './types'

/**
 * Get the arguments needed to call `openAuction()`
 *
 * @param _supply {share} Ideal basket
 * @param decimals Decimals of each token
 * @param _targetBasket D18{1} Ideal basket
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error, cannot pass 1
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @return sellLimit D27{sellTok/share} min ratio of sell token to shares allowed, inclusive
 * @return buyLimit D27{buyTok/share} max ratio of buy token to shares allowed, exclusive
 * @return startPrice D27{buyTok/sellTok}
 * @return endPrice D27{buyTok/sellTok}
 */
export const openAuction = (
  auction: Auction,
  _supply: bigint,
  tokens: string[],
  decimals: bigint[],
  _targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number
): [bigint, bigint, bigint, bigint] => {
  // convert price number inputs to bigints

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

  // {1}
  const priceError = _priceError.map((a) => new Decimal(a))

  // {wholeShare}
  const supply = new Decimal(_supply.toString()).div(D18d)

  // {1} = D18{1} / D18
  const targetBasket = _targetBasket.map((a) =>
    new Decimal(a.toString()).div(D18d)
  )

  // {USD} = {USD/wholeShare} * {wholeShare}
  const sharesValue = new Decimal(_dtfPrice).mul(supply)

  // ====

  // indices
  let x = prices.length
  let y = prices.length

  // find indices

  for (let i = 0; i < prices.length; i++) {
    if (tokens[i] == auction.sell) {
      x = i
    } else if (tokens[i] == auction.buy) {
      y = i
    }
  }

  if (x == prices.length || y == prices.length) {
    throw new Error('auction tokens not found in tokens array')
  }

  // calculate startPrice/endPrice

  // {wholeBuyTok/wholeSellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok}
  const wholePrice = prices[x].div(prices[y])

  // {buyTok/sellTok} = {wholeBuyTok/wholeSellTok} * {buyTok/wholeBuyTok} / {sellTok/wholeSellTok}
  const price = wholePrice
    .mul(new Decimal(`1e${decimals[y]}`))
    .div(new Decimal(`1e${decimals[x]}`))

  // {1}
  let avgPriceError = priceError[x].plus(priceError[y]).div(TWO)
  if (priceError[x].gte(ONE) || priceError[y].gte(ONE)) {
    throw new Error('price error too large')
  }

  // D27{buyTok/sellTok} = {buyTok/sellTok} / {1} * D27
  const idealStartPrice = BigInt(
    price.div(ONE.minus(avgPriceError)).mul(D27d).toFixed(0)
  )
  const idealEndPrice = BigInt(
    price.mul(ONE.minus(avgPriceError)).mul(D27d).toFixed(0)
  )

  if (
    auction.prices.start > 0n &&
    auction.prices.end > 0n &&
    (idealStartPrice > auction.prices.start ||
      idealEndPrice < auction.prices.end)
  ) {
    console.log('startPrice', auction.prices.start, idealStartPrice)
    console.log('endPrice', auction.prices.end, idealEndPrice)
    throw new Error('price has moved outside auction price range')
  }

  // calculate sellLimit/buyLimit

  // {wholeTok/wholeShare} = {1} * {USD} / {USD/wholeTok} / {wholeShare}
  const wholeSellLimit = targetBasket[x]
    .mul(sharesValue)
    .div(prices[x])
    .div(supply)
  const wholeBuyLimit = targetBasket[y]
    .mul(sharesValue)
    .div(prices[y])
    .div(supply)

  // D27{tok/share} = {wholeTok/wholeShare} * D27 * {tok/wholeTok} / {share/wholeShare}
  const sellLimit = BigInt(
    wholeSellLimit
      .mul(D27d)
      .mul(new Decimal(`1e${decimals[x]}`))
      .div(D18d)
      .toFixed(0)
  )

  const buyLimit = BigInt(
    wholeBuyLimit
      .mul(D27d)
      .mul(new Decimal(`1e${decimals[y]}`))
      .div(D18d)
      .toFixed(0)
  )

  if (
    sellLimit > auction.sellLimit.high ||
    sellLimit < auction.sellLimit.low ||
    buyLimit > auction.buyLimit.high ||
    buyLimit < auction.buyLimit.low
  ) {
    console.log(
      'sellLimit',
      sellLimit,
      auction.sellLimit.high,
      auction.sellLimit.low
    )
    console.log(
      'buyLimit',
      buyLimit,
      auction.buyLimit.high,
      auction.buyLimit.low
    )
    throw new Error(
      'sellLimit/buyLimit has deviated too much and is not in range'
    )
  }

  return [sellLimit, buyLimit, idealStartPrice, idealEndPrice]
}
