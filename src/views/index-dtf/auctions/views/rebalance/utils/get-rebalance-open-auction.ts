import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { Token } from '@/types'
import { calculatePriceFromRange } from '@/utils'
import {
  getOpenAuction,
  getTargetBasket,
  Rebalance,
} from '@reserve-protocol/dtf-rebalance-lib'
import { PRICE_VOLATILITY } from '../atoms'

function getRebalanceOpenAuction(
  tokens: Token[],
  rebalance: Rebalance,
  initialPrices: Record<string, { low: bigint; high: bigint }>,
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

  rebalance.tokens.forEach((token) => {
    const lowercasedAddress = token.toLowerCase()
    const tokenDecimals = tokenMap[lowercasedAddress].decimals

    decimals.push(BigInt(tokenDecimals))
    currentPrices.push(prices[lowercasedAddress].currentPrice)

    // Calculate snapshot price from initialPrices
    const priceRange = initialPrices[lowercasedAddress]
    const avgPriceAsWhole = calculatePriceFromRange(priceRange, tokenDecimals)

    snapshotPrices.push(avgPriceAsWhole)
    priceError.push(priceVolatility)
    initialFolioShares.push(initialFolio[lowercasedAddress] || 0n)
    currentFolioShares.push(currentFolio[lowercasedAddress] || 0n)
  })

  console.log('rebalance params', {
    rebalance: rebalance.weights,
    prices: isTrackingDTF ? currentPrices : snapshotPrices,
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
