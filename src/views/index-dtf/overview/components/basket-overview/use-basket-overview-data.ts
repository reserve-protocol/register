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

  const filtered = basket?.filter(
    (token) => basketShares[token.address] !== '0.00'
  )

  const exposureGroups = useAtomValue(indexDTFExposureMapAtom)

  const basketPerformanceChanges = useMemo(() => {
    return Object.fromEntries(
      [...(exposureGroups?.values() ?? [])].flatMap((group: ExposureGroup) => {
        return group.tokens.map((token) => {
          return [token.address.toLowerCase(), token?.change ?? 0]
        })
      })
    )
  }, [exposureGroups])

  const newlyAddedAssets = useMemo(() => {
    return Object.fromEntries(
      [...(exposureGroups?.values() ?? [])].flatMap((group: ExposureGroup) => {
        return group.tokens.map((token) => {
          return [token.address.toLowerCase(), group.hasNewlyAdded || false]
        })
      })
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
