import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from '@/state/atoms'
import {
  hasBridgedAssetsAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFBasketPerformanceChangeAtom,
  performanceTimeRangeAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFNewlyAddedAssetsAtom,
  indexDTFAtom,
} from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { groupByNativeAsset } from '@/utils/token-mappings'
import { useNativeTokenMarketCaps } from '@/hooks/use-native-token-market-caps'

export const useBasketOverviewData = (isExposure: boolean) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const basketPerformanceChanges = useAtomValue(indexDTFBasketPerformanceChangeAtom)
  const performanceLoading = useAtomValue(indexDTFPerformanceLoadingAtom)
  const newlyAddedAssets = useAtomValue(indexDTFNewlyAddedAssetsAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)

  // Enable exposure tab for BSC or specific DTF on Base
  const shouldShowExposureTabs = chainId === ChainId.BSC ||
    (chainId === ChainId.Base && dtf?.id.toLowerCase() === '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8')

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

    // Calculate weighted change for each group
    const groupsWithChange = new Map()
    groups.forEach((group) => {
      const weightedChange = group.tokens.reduce((acc, token) => {
        const change = basketPerformanceChanges[token.address] ?? 0
        const weight = token.weight / group.totalWeight
        return acc + change * weight
      }, 0)

      // Check if any token in group is newly added
      const hasNewlyAdded = group.tokens.some(token => newlyAddedAssets[token.address])

      groupsWithChange.set(group.native?.symbol || group.tokens[0].symbol, {
        ...group,
        weightedChange,
        hasNewlyAdded,
      })
    })

    return groupsWithChange
  }, [filtered, basketShares, chainId, isExposure, basketPerformanceChanges, newlyAddedAssets])

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
    basketPerformanceChanges,
    performanceLoading,
    newlyAddedAssets,
    timeRange,
    hasBridgedAssets,
    chainId,
    filtered,
    exposureGroups,
    marketCaps,
    isBSC: shouldShowExposureTabs,
  }
}