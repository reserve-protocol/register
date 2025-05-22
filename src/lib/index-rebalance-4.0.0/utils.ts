import Decimal from 'decimal.js-light'

import { bn, D18d } from './numbers'

/**
 * This function can be used to get a basket distribution EITHER from a set of historical basket weights
 * or from a set of current balances. Make sure to use prices from the right time.
 *
 * @param _bals {tok} Current balances; or previous historical weights
 * @param _prices {USD/wholeTok} USD prices for each *whole* token; or previous historical prices
 * @param decimals Decimals of each token
 * @returns D18{1} Current basket, total will be around 1e18 but not exactly
 */
export const getBasketDistribution = (
  _bals: bigint[],
  _prices: number[],
  decimals: bigint[]
): bigint[] => {
  const decimalScale = decimals.map((d) => new Decimal(`1e${d}`))

  // {wholeTok} = {tok} / {tok/wholeTok}
  const bals = _bals.map((bal, i) =>
    new Decimal(bal.toString()).div(decimalScale[i])
  )

  // {USD/wholeTok} = {USD/wholeTok}
  const prices = _prices.map((a) => new Decimal(a.toString()))

  // {USD} = {wholeTok} * {USD/wholeTok}
  const totalValue = bals
    .map((bal, i) => bal.mul(prices[i]))
    .reduce((a, b) => a.add(b))

  // D18{1} = {wholeTok} * {USD/wholeTok} / {USD}
  return bals.map((bal, i) => bn(bal.mul(prices[i]).div(totalValue).mul(D18d)))
}
