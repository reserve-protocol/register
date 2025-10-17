import { chainIdAtom } from '@/state/atoms'
import {
  ExposureGroup,
  hasBridgedAssetsAtom,
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFExposureMapAtom,
  indexDTFExposureMCapMapAtom,
  indexDTFPerformanceLoadingAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { MarketCapData } from '@/types/token-mappings'
import { ChainId } from '@/utils/chains'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

const ENABLE_EXPOSURE_TABS = [
  '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
  '0xb4da556350cf284d856353b4bc68e65d37fa509c',
]

export const useBasketOverviewData = (isExposure: boolean) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketShares = useAtomValue(indexDTFBasketSharesAtom)
  const performanceLoading = useAtomValue(indexDTFPerformanceLoadingAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)
  const hasBridgedAssets = useAtomValue(hasBridgedAssetsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)

  // Enable exposure tab for BSC or specific DTF on Base
  const shouldShowExposureTabs =
    chainId === ChainId.BSC ||
    (chainId === ChainId.Base &&
      ENABLE_EXPOSURE_TABS.includes(dtf?.id.toLowerCase() || ''))

  const filtered = basket?.filter(
    (token) => basketShares[token.address] !== '0.00'
  )

  const exposureGroups = useAtomValue(indexDTFExposureMapAtom)

  const basketPerformanceChanges = useMemo(() => {
    return Object.fromEntries(
      [...(exposureGroups?.values() ?? [])].flatMap((group: ExposureGroup) => {
        return group.tokens.map((token) => {
          return [token.address.toLowerCase(), group.change ?? 0]
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
    isBSC: shouldShowExposureTabs,
  }
}
