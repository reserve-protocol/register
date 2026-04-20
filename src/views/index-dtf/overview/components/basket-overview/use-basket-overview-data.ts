import { chainIdAtom } from '@/state/atoms'
import {
  ExposureGroup,
  hasBridgedAssetsAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFExposureMapAtom,
  indexDTFExposureMCapMapAtom,
  indexDTFPerformanceLoadingAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { MarketCapData } from '@/types/token-mappings'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export const useBasketOverviewData = () => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const performanceLoading = useAtomValue(indexDTFPerformanceLoadingAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)

  const filtered = useMemo(
    () => basket?.filter((token) => basketShares[token.address] !== '0.00'),
    [basket, basketShares]
  )

  const exposureGroupsRaw = useAtomValue(indexDTFExposureMapAtom)

  // null = not loaded yet, [] = loaded but empty
  const exposureGroups: [string, ExposureGroup][] | null = useMemo(() => {
    if (!exposureGroupsRaw) return null
    return [...exposureGroupsRaw.entries()].filter(
      ([, group]) => group.totalWeight.toFixed(2) !== '0.00'
    )
  }, [exposureGroupsRaw])

  const basketPerformanceChanges = useMemo(() => {
    if (!exposureGroups) return {}
    return Object.fromEntries(
      exposureGroups.flatMap(([, group]) =>
        group.tokens.map((token) => [
          token.address.toLowerCase(),
          token?.change ?? 0,
        ])
      )
    )
  }, [exposureGroups])

  const newlyAddedAssets = useMemo(() => {
    if (!exposureGroups) return {}
    return Object.fromEntries(
      exposureGroups.flatMap(([, group]) =>
        group.tokens.map((token) => [
          token.address.toLowerCase(),
          group.hasNewlyAdded || false,
        ])
      )
    )
  }, [exposureGroups])

  const marketCaps: MarketCapData = useAtomValue(indexDTFExposureMCapMapAtom)

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
  }
}
