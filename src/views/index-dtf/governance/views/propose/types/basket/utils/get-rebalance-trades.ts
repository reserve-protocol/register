export const D27: number = 10 ** 27
export const D27n: bigint = 10n ** 27n

// IFolio.Trade interface minus some fields
export interface ProposedTrade {
  sell: string
  buy: string
  sellLimit: bigint // D27{sellTok/share} spot est for min ratio of sell token to shares allowed, inclusive
  buyLimit: bigint // D27{buyTok/share} spot est for max ratio of buy token to shares allowed, exclusive
  startPrice: bigint // D27{buyTok/sellTok}
  endPrice: bigint // D27{buyTok/sellTok}
}

/**
 * @param bals {tok} Current balances
 * @param prices D27{USD/tok} USD prices for each token
 * @returns D27{1} Current basket, total will be around 1e18 but not exactly
 */
const getCurrentBasket = (bals: bigint[], prices: bigint[]): bigint[] => {
  // D27{USD} = {tok} * D27{USD/tok}
  const values = bals.map((bal, i) => bal * prices[i])

  // D27{USD}
  const total = values.reduce((a, b) => a + b)

  // D27{1} = D27{USD} * D27/ D27{USD}
  return values.map((amt, i) => (amt * D27n) / total)
}

/**
 * @param bals {tok} Current balances
 * @param prices D27{USD/tok} USD prices for each token
 * @returns D27{USD} Estimated USD value of all the shares
 */
const getSharesValue = (bals: bigint[], prices: bigint[]): bigint => {
  // D27{USD} = {tok} * D27{USD/tok}
  const values = bals.map((bal, i) => bal * prices[i])
  return values.reduce((a, b) => a + b)
}

/**
 *
 * Warnings:
 *   - Breakup large trades into smaller trades in advance of using this algo; a large Folio may have to use this
 *     algo multiple times to rebalance gradually to avoid transacting too much volume in any one trade.
 *
 * @param supply D27{share} Ideal basket
 * @param tokens Addresses of tokens in the basket
 * @param decimals Decimals of each token
 * @param bals {tok} Current balances, in wei
 * @param targetBasket D18{1} Ideal basket
 * @param _prices {USD/wholeTok} USD prices for each *whole* token
 * @param _priceError {1} Price error
 * @param tolerance D18{1} Tolerance for rebalancing to determine when to tolerance trade or not, default 0.1%
 */
export const getRebalanceTrades = (
  supply: bigint,
  tokens: string[],
  decimals: bigint[],
  bals: bigint[],
  targetBasket: bigint[],
  _prices: number[],
  _priceError: number[],
  tolerance: bigint = 10n ** 14n // 0.01%
): ProposedTrade[] => {
  const trades: ProposedTrade[] = []

  // convert price number inputs to bigints

  // D27{USD/tok} = {USD/wholeTok} * D27 / {tok/wholeTok}
  const prices = _prices.map((a, i) =>
    BigInt(Math.round((a * D27) / 10 ** Number(decimals[i])))
  )

  // D27{1} = {1} * D27
  const priceError = _priceError.map((a) => BigInt(Math.round(a * D27)))

  // D27{1} = D18{1} * D9
  targetBasket = targetBasket.map((a) => a * 10n ** 9n)

  // D27{1} imprecisely sums to 1e27
  const currentBasket = getCurrentBasket(bals, prices)

  // D27{USD}
  const sharesValue = getSharesValue(bals, prices)

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

    trades.push({
      sell: tokens[x],
      buy: tokens[y],
      sellLimit: sellLimit,
      buyLimit: buyLimit,
      startPrice: startPrice,
      endPrice: endPrice,
    })
  }
}
