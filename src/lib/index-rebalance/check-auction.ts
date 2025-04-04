import { Decimal } from 'decimal.js-light'

import { bn, D27d } from './numbers'
import { Auction } from './types'

/**
 * Check if a auction's price range contains the current market price, without accounting for slippage
 *
 * @param auction Auction
 * @param tokens Addresses of tokens in the basket, must match prices
 * @param decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token, must match tokens
 * @return boolean True if the auction price range contains the naive clearing price of the tokens in the auction
 *
 */
export const checkAuction = (
  auction: Auction,
  tokens: string[],
  decimals: bigint[],
  _prices: number[]
): boolean => {
  if (auction.prices.start == 0n && auction.prices.end == 0n) {
    return true
  }

  // {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a))

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

  // {wholeBuyTok/wholeSellTok} = {USD/wholeSellTok} / {USD/wholeBuyTok}
  const wholePrice = prices[x].div(prices[y])

  // {buyTok/sellTok} = {wholeBuyTok/wholeSellTok} * {buyTok/wholeBuyTok} / {sellTok/wholeSellTok}
  const price = wholePrice
    .mul(new Decimal(`1e${decimals[y]}`))
    .div(new Decimal(`1e${decimals[x]}`))

  // D27{buyTok/sellTok} = D27 * {buyTok/sellTok}
  const priceD27 = bn(price.mul(D27d))

  return priceD27 >= auction.prices.end && priceD27 <= auction.prices.start
}
