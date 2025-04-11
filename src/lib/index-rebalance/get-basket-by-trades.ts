import { Auction } from './types'
import { getCurrentBasket } from './utils'
import { D9n } from './numbers'

/**
 * Get target basket for a tracking DTF based on prepared auctions and current balances
 *
 * @param auctions Auctions
 * @param tokens Addresses of tokens in the basket
 * @param amounts {tok} Current balances of each token per Folio share
 * @param decimals Decimals of each token
 * @param _prices {USD/wholeTok} Current USD prices for each *whole* token
 * @returns basket D18{1} Resulting basket from running the smallest auction first
 */
export const getBasketTrackingDTF = (
  auctions: Auction[],
  tokens: string[],
  amounts: bigint[],
  decimals: bigint[],
  _prices: number[]
): bigint[] => {
  console.log('getBasketTrackingDTF()', auctions, tokens, decimals, _prices)

  console.log(
    '--------------------------------------------------------------------------------'
  )

  // D27{tok/share}
  const basketRatios = getBasketRatiosFromAuctions(tokens, amounts, auctions)

  return getCurrentBasket(basketRatios, decimals, _prices)
}

/**
 *
 * @return D27{tok/share} The basket ratios as 27-decimal bigints
 *  */
export const getBasketRatiosFromAuctions = (
  tokens: string[],
  amounts: bigint[],
  auctions: Auction[]
): bigint[] => {
  const basketRatios: bigint[] = []

  for (let i = 0; i < tokens.length; i++) {
    // loop through all auctions and fetch basket ratios; must be uniform!

    let basketRatio = -1n // -1n means the token isn't present in the auctions period, and therefore this approach doesn't work

    for (let j = 0; j < auctions.length; j++) {
      if (tokens[i] == auctions[j].sell) {
        if (basketRatio != -1n && basketRatio != auctions[j].sellLimit.spot) {
          throw new Error('basket ratios must be uniform! sell side')
        }

        basketRatio = auctions[j].sellLimit.spot
      } else if (tokens[i] == auctions[j].buy) {
        if (basketRatio != -1n && basketRatio != auctions[j].buyLimit.spot) {
          throw new Error('basket ratios must be uniform! buy side')
        }

        basketRatio = auctions[j].buyLimit.spot
      }
    }

    if (basketRatio == -1n) {
      console.log(
        'token missing from auctions, using current balance',
        tokens[i]
      )

      // get amount from current balance

      // D27{tok/share} = D18{tok/share} * D9
      basketRatio = amounts[i] * D9n
    }

    basketRatios.push(basketRatio)
  }

  return basketRatios
}
