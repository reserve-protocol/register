import { Decimal } from 'decimal.js-light'

import { bn, D18d, D27d, ONE, TWO } from './numbers'
import { Auction } from './types'

/**
 * Get the arguments needed to call `openAuction()` by the auction launcher, after prices have already
 * moved from the initial ones used to approve the auction.
 *
 * @param auction The auction constructed intially by governance
 * @param initialPrices D27{buyTok/sellTok} The initialPrices field of the AuctionDetails struct
 * @param _supply {share} Current supply
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param _targetBasket D18{1} The ideal basket that governance *intended* to target, originally
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error, cannot exceed 1
 * @param _dtfPrice {USD/wholeShare} DTF price
 * @param ejectFully If true, will buy as much of the buy token as possible if the sellLimit is also 0
 * @return sellLimit D27{sellTok/share} min amount of sell token in basket
 * @return buyLimit D27{buyTok/share} max amount of buy token in basket
 * @return startPrice D27{buyTok/sellTok}
 * @return endPrice D27{buyTok/sellTok}
 */
export const openAuction = (
  auction: Auction,
  initialPrices: { start: bigint; end: bigint },
  _supply: bigint,
  tokens: string[],
  decimals: bigint[],
  _targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  _dtfPrice: number,
  ejectFully: boolean = false
): [bigint, bigint, bigint, bigint] => {
  console.log(
    'openAuction()',
    auction,
    _supply,
    tokens,
    decimals,
    _targetBasket,
    _prices,
    _priceError,
    _dtfPrice
  )

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

  // D27{buyTok/sellTok} = {buyTok/sellTok} / {1} * D27
  const spotPrice = bn(price.mul(D27d))

  // {1}
  const avgPriceError = priceError[x].plus(priceError[y]).div(TWO)
  if (priceError[x].gte(ONE) || priceError[y].gte(ONE)) {
    throw new Error('price error too large')
  }

  // D27{buyTok/sellTok} = {buyTok/sellTok} / {1} * D27
  let startPrice = bn(price.div(ONE.minus(avgPriceError)).mul(D27d))
  let endPrice = bn(price.mul(ONE.minus(avgPriceError)).mul(D27d))

  // check spot price against 50x multiple to keep headroom for price to move more; don't want to lose value
  if (
    initialPrices.start > 0n &&
    initialPrices.end > 0n &&
    (spotPrice > initialPrices.start * 50n ||
      startPrice > initialPrices.start * 100n ||
      spotPrice < initialPrices.end)
  ) {
    console.log('startPrice', startPrice, initialPrices.start)
    console.log('endPrice', endPrice, initialPrices.end)
    console.log('spotPrice', spotPrice)
    throw new Error('spot price has moved outside valid auction price range')
  }

  if (startPrice < initialPrices.start) {
    startPrice = initialPrices.start
  }
  if (endPrice < initialPrices.end) {
    endPrice = initialPrices.end
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
  let sellLimit = bn(
    wholeSellLimit
      .mul(D27d)
      .mul(new Decimal(`1e${decimals[x]}`))
      .div(D18d)
  )

  let buyLimit = bn(
    wholeBuyLimit
      .mul(D27d)
      .mul(new Decimal(`1e${decimals[y]}`))
      .div(D18d)
  )

  if (sellLimit < auction.sellLimit.low) {
    sellLimit = auction.sellLimit.low
  }
  if (sellLimit > auction.sellLimit.high) {
    sellLimit = auction.sellLimit.high
  }
  if (buyLimit < auction.buyLimit.low) {
    buyLimit = auction.buyLimit.low
  }
  if ((sellLimit == 0n && ejectFully) || buyLimit > auction.buyLimit.high) {
    buyLimit = auction.buyLimit.high
  }

  console.log(
    'sellLimit',
    auction.sellLimit.low,
    sellLimit,
    auction.sellLimit.high
  )
  console.log('buyLimit', auction.buyLimit.low, buyLimit, auction.buyLimit.high)

  return [sellLimit, buyLimit, startPrice, endPrice]
}
