import { Decimal } from 'decimal.js-light'

import { D9d, D18n, D27d, ZERO } from './numbers'

/// Convert array of number to Decimals, throwing on 0
export const toDecimals = (_arr: number[]): Decimal[] => {
  const arr = _arr.map((a) => new Decimal(a))
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].lte(ZERO)) {
      throw new Error('a price is zero')
    }
  }
  return arr
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
  const sharePrice = BigInt(new Decimal(_sharePrice).mul(D9d).toFixed(0))

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const price = BigInt(
    new Decimal(_price)
      .mul(D27d)
      .div(new Decimal(`1e${decimals}`))
      .toFixed(0)
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
    BigInt(
      new Decimal(a)
        .mul(D27d)
        .div(new Decimal(`1e${decimals[i]}`))
        .toFixed(0)
    )
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
