import { Trade } from './types'
import { D9, D9n, D27, D27n } from './numbers'
import { getBasketPortion } from './utils'

/**
 * Get basket from a set of trades
 *
 * Works by presuming the smallest trade is executed iteratively until all trades are exhausted
 *
 * @param supply {share} DTF supply
 * @param trades Trades
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param currentBasket D18{1} Current basket breakdown
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @returns basket D18{1} Resulting basket from running the smallest trade first
 */
export const getBasket = (
  supply: bigint,
  trades: Trade[],
  tokens: string[],
  decimals: bigint[],
  currentBasket: bigint[],
  _prices: number[],
  _dtfPrice: number
): bigint[] => {
  // convert price number inputs to bigints

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    BigInt(a * 10 ** (27 - Number(decimals[i])))
  )

  // upscale currentBasket and targetBasket to D27

  // D27{1} = D18{1} * D9
  currentBasket = currentBasket.map((a) => a * 10n ** 9n)

  console.log(
    '--------------------------------------------------------------------------------'
  )

  // D27{USD} = {USD/wholeShare} * D27 * {share} / {share/wholeShare}
  const sharesValue = BigInt(_dtfPrice * D9) * supply

  console.log('sharesValue', sharesValue)

  // process the smallest trade first until we hit an unbounded traded

  while (trades.length > 0) {
    let tradeIndex = 0

    // find index of smallest trade index

    // D27{USD}
    let smallestSwap = 10n ** 54n // max

    for (let i = 0; i < trades.length; i++) {
      const x = tokens.indexOf(trades[i].sell)
      const y = tokens.indexOf(trades[i].buy)

      // D27{1}
      const [, sellTarget] = getBasketPortion(
        trades[i].sellLimit.spot,
        decimals[x],
        _prices[x],
        _dtfPrice
      )
      const [, buyTarget] = getBasketPortion(
        trades[i].buyLimit.spot,
        decimals[y],
        _prices[y],
        _dtfPrice
      )

      let tradeValue = smallestSwap

      if (currentBasket[x] > sellTarget) {
        // D27{USD} = D27{1} * D27{USD} / D27
        const surplus = ((currentBasket[x] - sellTarget) * sharesValue) / D27n
        if (surplus < tradeValue) {
          tradeValue = surplus
        }
      }

      if (currentBasket[y] < buyTarget) {
        // D27{USD} = D27{1} * D27{USD} / D27
        const deficit = ((buyTarget - currentBasket[y]) * sharesValue) / D27n
        if (deficit < tradeValue) {
          tradeValue = deficit
        }
      }

      if (tradeValue < smallestSwap) {
        smallestSwap = tradeValue
        tradeIndex = i
      }
    }

    // simulate swap and update currentBasket
    // if no trade was smallest, default to 0th index

    const x = tokens.indexOf(trades[tradeIndex].sell)
    const y = tokens.indexOf(trades[tradeIndex].buy)

    // check price is within price range

    // D27{buyTok/sellTok} = D27{USD/sellTok} * D27 / D27{USD/buyTok}
    const price = (prices[x] * D27n) / prices[y]
    if (
      price > trades[tradeIndex].prices.start ||
      price < trades[tradeIndex].prices.end
    ) {
      throw new Error(
        `price ${price} out of range [${trades[tradeIndex].prices.start}, ${trades[tradeIndex].prices.end}]`
      )
    }

    // D27{1} = D27{USD} * D27 / D27{USD}
    const backingTraded = (smallestSwap * D27n) / sharesValue

    // D27{1}
    currentBasket[x] -= backingTraded
    currentBasket[y] += backingTraded

    // remove the trade
    trades.splice(tradeIndex, 1)
  }

  // make it sum to 1e27
  let sum = 0n
  for (let i = 0; i < currentBasket.length; i++) {
    sum += currentBasket[i]
  }

  if (sum < D27n) {
    currentBasket[0] += D27n - sum
  }

  // remove 9 decimals
  return currentBasket.map((a) => a / D9n)
}
