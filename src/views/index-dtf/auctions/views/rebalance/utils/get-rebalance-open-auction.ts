import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { Token } from '@/types'
import {
  getOpenAuction,
  getTargetBasket,
  Rebalance,
} from '@reserve-protocol/dtf-rebalance-lib'
import { PRICE_VOLATILITY } from '../atoms'

function getRebalanceOpenAuction(
  tokens: Token[],
  rebalance: Rebalance,
  supply: bigint,
  currentFolio: Record<string, bigint>,
  initialFolio: Record<string, bigint>,
  prices: TokenPriceWithSnapshot,
  isTrackingDTF: boolean,
  rebalancePercent = 95,
  priceVolatility = PRICE_VOLATILITY.MEDIUM
) {
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  // Lets start by creating a map of the basket tokens
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const snapshotPrices: number[] = []
  const priceError: number[] = []
  const initialFolioShares: bigint[] = []
  const currentFolioShares: bigint[] = []

  rebalance.tokens.forEach((token, index) => {
    const lowercasedAddress = token.toLowerCase()

    decimals.push(BigInt(tokenMap[lowercasedAddress].decimals))
    currentPrices.push(prices[lowercasedAddress].currentPrice)
    snapshotPrices.push(prices[lowercasedAddress].snapshotPrice)
    priceError.push(priceVolatility)
    initialFolioShares.push(initialFolio[lowercasedAddress] || 0n)
    currentFolioShares.push(currentFolio[lowercasedAddress] || 0n)
  })

  const targetBasket = getTargetBasket(
    rebalance.weights,
    isTrackingDTF ? currentPrices : snapshotPrices,
    decimals
  )

  return getOpenAuction(
    rebalance,
    supply,
    initialFolioShares,
    targetBasket,
    currentFolioShares,
    decimals,
    currentPrices,
    priceError,
    rebalancePercent / 100
  )
}

export default getRebalanceOpenAuction
