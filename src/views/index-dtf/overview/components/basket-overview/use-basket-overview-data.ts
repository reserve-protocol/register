import { useNativeTokenMarketCaps } from '@/hooks/use-native-token-market-caps'
import { chainIdAtom } from '@/state/atoms'
import {
  hasBridgedAssetsAtom,
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPerformanceChangeAtom,
  indexDTFBasketSharesAtom,
  indexDTFExposureMapAtom,
  indexDTFNewlyAddedAssetsAtom,
  indexDTFPerformanceLoadingAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export const useBasketOverviewData = (isExposure: boolean) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const basketPerformanceChanges = useAtomValue(
    indexDTFBasketPerformanceChangeAtom
  )
  const performanceLoading = useAtomValue(indexDTFPerformanceLoadingAtom)
  const newlyAddedAssets = useAtomValue(indexDTFNewlyAddedAssetsAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)

  // Enable exposure tab for BSC or specific DTF on Base
  const shouldShowExposureTabs =
    chainId === ChainId.BSC ||
    (chainId === ChainId.Base &&
      dtf?.id.toLowerCase() === '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8')

  const filtered = basket?.filter(
    (token) => basketShares[token.address] !== '0.00'
  )

  const exposureMapFromAtom = useAtomValue(indexDTFExposureMapAtom)

  const exposureGroups = useMemo(() => {
    if (!isExposure || !exposureMapFromAtom) return null

    const groupsWithChange = new Map()
    exposureMapFromAtom.forEach((group, key) => {
      const weightedChange = group.tokens.reduce((acc: number, token: any) => {
        const change = basketPerformanceChanges[token.address] ?? 0
        const weight = token.weight / group.totalWeight
        return acc + change * weight
      }, 0)

      const hasNewlyAdded = group.tokens.some(
        (token: any) => newlyAddedAssets[token.address]
      )

      groupsWithChange.set(key, {
        ...group,
        weightedChange:
          group.change !== undefined ? group.change : weightedChange,
        hasNewlyAdded:
          group.hasNewlyAdded !== undefined
            ? group.hasNewlyAdded
            : hasNewlyAdded,
      })
    })

    return groupsWithChange
  }, [
    isExposure,
    exposureMapFromAtom,
    basketPerformanceChanges,
    newlyAddedAssets,
  ])

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
