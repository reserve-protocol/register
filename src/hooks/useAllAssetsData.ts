import { Token } from '@/types'
import { useMemo } from 'react'
import { useAssetPrices } from './useAssetPrices'
import useTokensInfo from './useTokensInfo'

const useAllAssetsData = (
  basket: Token[] | undefined,
  currentPrices: Record<string, number>,
  allTokenAddresses: string[]
) => {
  // Grab all missing tokens from the price map
  // Assume assets on the price map are already in the basket
  const missingTokens = useMemo(() => {
    if (Object.keys(currentPrices).length === 0) return undefined

    const currentTokens = new Set(Object.keys(currentPrices))
    const missingTokenSet = new Set<string>()

    allTokenAddresses.forEach((address) => {
      if (!currentTokens.has(address.toLowerCase())) {
        missingTokenSet.add(address.toLowerCase())
      }
    })

    return [...missingTokenSet]
  }, [currentPrices])

  // Grab both missing prices and tokens info
  const { data: newPrices } = useAssetPrices(missingTokens ?? [])
  const { data: newTokensInfo } = useTokensInfo(missingTokens ?? [])

  return useMemo(() => {
    const isThereMissingTokens = missingTokens && missingTokens.length > 0

    // If there are missing tokens but no results or if there is missing initial data
    if (
      (isThereMissingTokens && (!newPrices || !newTokensInfo)) ||
      !basket ||
      Object.keys(currentPrices).length === 0
    ) {
      return undefined
    }

    const allPrices = {
      ...currentPrices,
      ...(newPrices?.reduce(
        (acc, price) => {
          acc[price.address.toLowerCase()] = price.price ?? 0
          return acc
        },
        {} as Record<string, number>
      ) ?? {}),
    }
    const allTokens = {
      ...basket.reduce(
        (acc, token) => {
          acc[token.address] = token
          return acc
        },
        {} as Record<string, Token>
      ),
      ...newTokensInfo,
    }

    return [allTokens, allPrices]
  }, [basket, currentPrices, newPrices, newTokensInfo])
}

export default useAllAssetsData
