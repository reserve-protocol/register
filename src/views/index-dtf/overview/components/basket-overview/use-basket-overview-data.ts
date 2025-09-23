import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from '@/state/atoms'
import {
  hasBridgedAssetsAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFBasket7dChangeAtom,
} from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { groupByNativeAsset } from '@/utils/token-mappings'
import { useNativeTokenMarketCaps } from '@/hooks/use-native-token-market-caps'

export const useBasketOverviewData = (isExposure: boolean) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const basket7dChanges = useAtomValue(indexDTFBasket7dChangeAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isBSC = chainId === ChainId.BSC

  // Filter out zero-weight tokens
  const filtered = basket?.filter(
    (token) => basketShares[token.address] !== '0.00'
  )

  // Calculate exposure groups for exposure view
  const exposureGroups = useMemo(() => {
    if (!filtered || !isExposure) return null

    const tokenData = filtered.map((token) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      weight: parseFloat(basketShares[token.address] || '0'),
    }))

    const groups = groupByNativeAsset(tokenData, chainId)

    // Calculate weighted 7d change for each group
    const groupsWithChange = new Map()
    groups.forEach((group) => {
      const weightedChange = group.tokens.reduce((acc, token) => {
        const change = basket7dChanges[token.address] ?? 0
        const weight = token.weight / group.totalWeight
        return acc + change * weight
      }, 0)
      groupsWithChange.set(group.native?.symbol || group.tokens[0].symbol, {
        ...group,
        weightedChange,
      })
    })

    return groupsWithChange
  }, [filtered, basketShares, chainId, isExposure, basket7dChanges])

  // Extract CoinGecko IDs for market cap fetching
  const exposureCoingeckoIds = useMemo(() => {
    if (!exposureGroups) return []
    const ids: string[] = []
    exposureGroups.forEach((group) => {
      if (group.native?.coingeckoId) {
        ids.push(group.native.coingeckoId)
      }
    })
    return ids
  }, [exposureGroups])

  // Fetch market cap data
  const { data: marketCaps } = useNativeTokenMarketCaps(exposureCoingeckoIds)

  return {
    basket,
    basketShares,
    basket7dChanges,
    hasBridgedAssets,
    chainId,
    filtered,
    exposureGroups,
    marketCaps,
    isBSC,
  }
}