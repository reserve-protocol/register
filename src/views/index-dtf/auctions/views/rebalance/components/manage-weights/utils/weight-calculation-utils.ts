import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { Address, parseUnits } from 'viem'
import { BasketItem } from '@/components/index-basket-setup'

export const calculateTargetShares = (
  rebalanceTokens: string[],
  tokenMap: Record<string, any>,
  proposedUnits: Record<string, string>,
  basketItems: Record<string, BasketItem>,
  currentAssets: Record<string, bigint>,
  prices: Record<string, { currentPrice: number }>
) => {
  const tokenData = rebalanceTokens.map((tokenAddress) => {
    const address = tokenAddress.toLowerCase()
    const token = tokenMap[address]
    const proposedUnit =
      proposedUnits[address] || basketItems[address]?.currentValue || '0'
    const decimals = token.decimals || 18

    let bal: bigint
    try {
      bal = parseUnits(proposedUnit, decimals)
    } catch {
      bal = currentAssets[address] || 0n
    }

    return {
      address,
      bal,
      decimals: BigInt(decimals),
      price: prices[address]?.currentPrice || 0,
    }
  })

  return getCurrentBasket(
    tokenData.map((d) => d.bal),
    tokenData.map((d) => d.decimals),
    tokenData.map((d) => d.price)
  )
}

export const prepareRebalanceData = (
  targetShares: bigint[],
  rebalanceTokens: string[],
  tokenMap: Record<string, any>,
  basketItems: Record<string, BasketItem>,
  currentAssets: Record<string, bigint>,
  prices: Record<string, { currentPrice: number }>
) => {
  const tokens: Address[] = []
  const decimals: bigint[] = []
  const currentBasket: bigint[] = []
  const targetBasket: bigint[] = []
  const priceArray: number[] = []
  const error: number[] = []
  const assets: bigint[] = []

  rebalanceTokens.forEach((tokenAddress, index) => {
    const address = tokenAddress.toLowerCase()
    const token = tokenMap[address]

    tokens.push(tokenAddress as Address)
    decimals.push(BigInt(token.decimals || 18))
    currentBasket.push(
      parseUnits(basketItems[address]?.currentShares || '0', 16)
    )
    targetBasket.push(targetShares[index])
    assets.push(currentAssets[address] || 0n)
    priceArray.push(prices[address]?.currentPrice || 0)
    error.push(0.8)
  })

  return {
    tokens,
    decimals,
    currentBasket,
    targetBasket,
    prices: priceArray,
    error,
    assets,
  }
}
