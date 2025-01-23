import { Trade } from './types'
import { D27, D27n } from './numbers'
import { getCurrentBasket, getSharePricing, makeTrade } from './utils'

/**
 * Get trades from basket
 *
 * Warnings:
 *   - Breakup large trades into smaller trades in advance of using this algo; a large Folio may have to use this
 *     algo multiple times to rebalance gradually to avoid transacting too much volume in any one trade.
 *
 * @param supply {share} Ideal basket
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param bals {tok} Current balances
 * @param targetBasket D18{1} Ideal basket
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error, pass 1 to fully defer to price curator / auction launcher
 * @param tolerance D18{1} Tolerance for rebalancing to determine when to tolerance trade or not, default 0.1%
 */
export const getTrades = (
  supply: bigint,
  tokens: string[],
  decimals: bigint[],
  bals: bigint[],
  targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  tolerance: bigint = 10n ** 14n // 0.01%
): Trade[] => {
  const trades: Trade[] = []

  // convert price number inputs to bigints

  // convert price number inputs to bigints

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    BigInt(Math.round((a * D27) / 10 ** Number(decimals[i])))
  )

  // D27{1} = {1} * D27
  const priceError = _priceError.map((a) => BigInt(Math.round(a * D27)))

  // D27{1} = D18{1} * D9
  targetBasket = targetBasket.map((a) => a * 10n ** 9n)

  console.log(
    '--------------------------------------------------------------------------------'
  )

  // D27{1} approx sum 1e27
  const currentBasket = getCurrentBasket(bals, decimals, _prices)

  // D27{USD}, {USD/wholeShare}
  const [sharesValue, sharePrice] = getSharePricing(
    supply,
    bals,
    decimals,
    _prices
  )
  console.log('shares', sharesValue, sharePrice)

  // queue up trades until there are no more trades-to-make greater than tolerance in size
  //
  // trades returned will never be longer than tokens.length - 1
  // proof left as an exercise to the reader

  while (true) {
    if (trades.length > tokens.length - 1) {
      throw new Error('something has gone very wrong')
    }

    // indices
    let x = tokens.length // sell index
    let y = tokens.length // buy index

    // D27{USD}
    let biggestSurplus = 0n
    let biggestDeficit = 0n

    console.log('currentBasket', currentBasket)
    console.log('targetBasket', targetBasket)

    for (let i = 0; i < tokens.length; i++) {
      if (
        currentBasket[i] > targetBasket[i] &&
        currentBasket[i] - targetBasket[i] > tolerance
      ) {
        // D27{USD} = D27{1} * D27{USD} / D27
        const surplus =
          ((currentBasket[i] - targetBasket[i]) * sharesValue) / D27n
        if (surplus > biggestSurplus) {
          biggestSurplus = surplus
          x = i
        }
      } else if (
        currentBasket[i] < targetBasket[i] &&
        targetBasket[i] - currentBasket[i] > tolerance
      ) {
        // D27{USD} = D27{1} * D27{USD} / D27
        const deficit =
          ((targetBasket[i] - currentBasket[i]) * sharesValue) / D27n
        if (deficit > biggestDeficit) {
          biggestDeficit = deficit
          y = i
        }
      }
    }

    // if we don't find any more trades, we're done
    if (x == tokens.length || y == tokens.length) {
      return trades
    }

    // simulate swap and update currentBasket

    // D27{USD}
    const maxTrade =
      biggestDeficit < biggestSurplus ? biggestDeficit : biggestSurplus

    // D27{1} = D27{USD} * D27 / D27{USD}
    const backingTraded = (maxTrade * D27n) / sharesValue

    console.log('backingTraded', backingTraded)

    // D27{1}
    currentBasket[x] -= backingTraded
    currentBasket[y] += backingTraded

    // D27{1}
    const avgPriceError = (priceError[x] + priceError[y]) / 2n

    if (avgPriceError >= D27) {
      throw new Error('error too large')
    }

    // D27{tok/share} = D27{1} * D27{USD} / D27{USD/tok} / {share}
    const sellLimit =
      ((targetBasket[x] * sharesValue + prices[x] - 1n) / prices[x] +
        supply -
        1n) /
      supply
    const buyLimit =
      ((targetBasket[y] * sharesValue + prices[y] - 1n) / prices[y] +
        supply -
        1n) /
      supply

    // D27{buyTok/sellTok} = D27{USD/sellTok} * D27 / D27{USD/buyTok}
    const price = (prices[x] * D27n) / prices[y]

    // D27{buyTok/sellTok} = D27{buyTok/sellTok} * D27 / D27{1}
    const startPrice =
      (price * D27n + D27n - avgPriceError - 1n) / (D27n - avgPriceError)
    const endPrice = (price * (D27n - avgPriceError)) / D27n

    // add trade into set

    trades.push(
      makeTrade(tokens[x], tokens[y], sellLimit, buyLimit, startPrice, endPrice)
    )

    // do not remove console.logs they do not show in tests that succeed
    console.log('sellLimit', trades[trades.length - 1].sellLimit.spot)
    console.log('buyLimit', trades[trades.length - 1].buyLimit.spot)
    console.log('startPrice', trades[trades.length - 1].prices.start)
    console.log('endPrice', trades[trades.length - 1].prices.end)
    console.log('currentBasket', currentBasket)
  }
}
