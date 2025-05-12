import { Decimal } from 'decimal.js-light'

import { bn, D9d, D18n, D27d, D27n } from './numbers'
import { Auction } from './types'

/**
 * @param decimals Decimals of token
 * @param _price {USD/wholeTok} Price of the *whole* token
 * @param _sharePrice {USD/wholeShare} Price of the *whole* share
 * @param dustThreshold D18{1} Portion of basket below which tokens are considered dust
 * @return D27{tok/share} dustAmount
 */
export const getDustAmount = (
  decimals: bigint,
  _price: number,
  _sharePrice: number,
  dustThreshold: bigint = bn('1e12') // 0.0001%
): bigint => {
  // D27{USD/share} = {USD/wholeShare} * D27 / {share/wholeShare}
  const sharePrice = bn(new Decimal(_sharePrice).mul(D9d))

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const price = bn(
    new Decimal(_price).mul(D27d).div(new Decimal(`1e${decimals}`))
  )

  // D27{tok/share} = D27{USD/share} * D27 / D27{USD/tok}
  const ratio = (sharePrice * D27n) / price

  // D27{tok/share} * D18{1} / D18
  return (ratio * dustThreshold) / D18n
}
/**
 * @param limit D27{tok/share} Range.buyLimit or Range.sellLimit
 * @param decimals Decimals of the token
 * @param _price {USD/wholeTok} Price of the *whole* token
 * @param _sharePrice {USD/wholeShare} Price of the *whole* share
 * @return {1} % of the basket given by the limit, as a number
 * @return D27{1} % of the basket given by the limit, as a 27-decimal bigint
 */
export const getBasketPortion = (
  limit: bigint,
  decimals: bigint,
  _price: number,
  _sharePrice: number
): [number, bigint] => {
  // D27{USD/share} = {USD/wholeShare} * D27 / {share/wholeShare}
  const sharePrice = bn(new Decimal(_sharePrice).mul(D9d))

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const price = bn(
    new Decimal(_price).mul(D27d).div(new Decimal(`1e${decimals}`))
  )

  // D27{1} = D27{tok/share} * D27{USD/tok} / D27{USD/share}
  const portion = (limit * price) / sharePrice

  return [new Decimal(portion.toString()).div(D27d).toNumber(), portion]
}

/**
 * @param bals {tok} Current balances
 * @param decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @returns D18{1} Current basket, total will be around 1e18 but not exactly
 */
export const getCurrentBasket = (
  bals: bigint[],
  decimals: bigint[],
  _prices: number[]
): bigint[] => {
  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    bn(new Decimal(a).mul(D27d).div(new Decimal(`1e${decimals[i]}`)))
  )

  // D27{USD} = {tok} * D27{USD/tok}
  const values = bals.map((bal, i) => bal * prices[i])

  // D27{USD}
  const total = values.reduce((a, b) => a + b)

  // D18{1} = D27{USD} * D18 / D27{USD}
  return values.map((amt) => (amt * D18n) / total)
}

/**
 * @param supply {share} DTF supply
 * @param bals {tok} Current balances
 * @param decimals Decimals of each token
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @returns sharesValue D27{USD} Estimated USD value of all the shares
 * @returns sharePrice {USD/wholeShare} Estimated USD value of each *whole* share
 */
export const getSharePricing = (
  supply: bigint,
  bals: bigint[],
  decimals: bigint[],
  _prices: number[]
): [bigint, number] => {
  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    bn(new Decimal(a).mul(D27d).div(new Decimal(`1e${decimals[i]}`)))
  )

  // D27{USD} = {tok} * D27{USD/tok}
  const values = bals.map((bal, i) => bal * prices[i])
  const total = values.reduce((a, b) => a + b)

  // {USD/wholeShare} = D27{USD} / (D18{wholeShare} * D9)
  // const per = Number(total) / Number(supply * D9n);
  const per = new Decimal(total.toString())
    .div(new Decimal(supply.toString()).mul(D9d))
    .toNumber()

  return [total, per]
}

export const makeAuction = (
  sell: string,
  buy: string,
  sellLimit: bigint,
  buyLimit: bigint,
  startPrice: bigint,
  endPrice: bigint,
  avgPriceError: bigint = 0n
): Auction => {
  if (sellLimit > 10n ** 54n || buyLimit > 10n ** 54n) {
    throw new Error('limits outside range')
  }
  if (startPrice >= 10n ** 54n || endPrice >= 10n ** 54n) {
    throw new Error(`price outside 1e54 range [${startPrice}, ${endPrice}]`)
  }

  return {
    sell: sell,
    buy: buy,
    sellLimit: {
      spot: sellLimit,
      low:
        avgPriceError >= D18n
          ? 0n
          : (sellLimit * (D18n - avgPriceError)) / D18n,
      high:
        avgPriceError >= D18n
          ? 10n ** 54n
          : (sellLimit * D18n + D18n - avgPriceError - 1n) /
            (D18n - avgPriceError),
    },
    buyLimit: {
      spot: buyLimit,
      low:
        avgPriceError >= D18n ? 1n : (buyLimit * (D18n - avgPriceError)) / D18n,
      high:
        avgPriceError >= D18n
          ? 10n ** 54n
          : (buyLimit * D18n + D18n - avgPriceError - 1n) /
            (D18n - avgPriceError),
    },
    prices: {
      start: avgPriceError == D18n ? 0n : startPrice,
      end: avgPriceError == D18n ? 0n : endPrice,
    },
  }
}
