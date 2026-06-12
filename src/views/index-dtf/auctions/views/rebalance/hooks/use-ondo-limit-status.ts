import { AuctionMetrics } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { currentRebalanceAtom } from '../../../atoms'
import {
  areWeightsSavedAtom,
  rebalanceAuctionsAtom,
  rebalanceMetricsAtom,
  savedWeightsAtom,
} from '../atoms'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'
import {
  ExceededOndoLeg,
  getExceededOndoLegs,
  getMaxSafeRebalancePercent,
  getScaledLegSizes,
  SizesByAddress,
} from '../utils/get-max-safe-percent'
import useRebalanceParams from './use-rebalance-params'
import useOndoLimits from './use-ondo-limits'

type OndoLimitStatus = {
  // Highest percent at which every open Ondo leg fits its session cap (soft —
  // the slider can still surpass it). 100 when there are no Ondo constraints.
  maxSafePercent: number
  // Open Ondo legs over their soft cap at the current percent.
  exceeded: ExceededOndoLeg[]
}

const useOndoLimitStatus = (): OndoLimitStatus => {
  const params = useRebalanceParams()
  const currentRebalance = useAtomValue(currentRebalanceAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const savedWeights = useAtomValue(savedWeightsAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const ondoLimits = useOndoLimits()

  const maxSafePercent = useMemo(() => {
    if (!params || !currentRebalance || Object.keys(ondoLimits).length === 0)
      return 100

    const weightsToUse =
      isHybridDTF && areWeightsSaved && savedWeights && auctions.length === 0
        ? savedWeights
        : params.initialWeights

    const computeMetrics = (percent: number): AuctionMetrics | null => {
      try {
        const [, m] = getRebalanceOpenAuction(
          params.folioVersion,
          currentRebalance.rebalance.tokens,
          params.rebalance,
          params.supply,
          params.initialSupply,
          params.currentAssets,
          params.initialAssets,
          params.initialPrices,
          weightsToUse,
          params.prices,
          params.isTrackingDTF,
          params.tokenPriceVolatility,
          percent,
          isHybridDTF
        )
        return m
      } catch (e) {
        // Expected at some probe percents for a broken rebalance (the metrics
        // updater surfaces that); log so an unexpected failure is still visible.
        console.error('getRebalanceOpenAuction failed sizing Ondo legs at', percent, e)
        return null
      }
    }

    const computeSizes = (percent: number): SizesByAddress | null => {
      const m = computeMetrics(percent)
      return m && getScaledLegSizes(m)
    }

    // At or below relativeProgression + 1 the SDK flips to a FINAL round that
    // trades everything — keep the cap out of that zone (same +2 margin the
    // dev slider guard uses). Progression doesn't depend on the percent, so
    // probing at 100 is fine.
    const probe = computeMetrics(100)
    const minPercent = probe
      ? Math.min(100, Math.ceil(probe.relativeProgression * 100) + 2)
      : undefined

    return getMaxSafeRebalancePercent(computeSizes, ondoLimits, minPercent)
  }, [
    params,
    currentRebalance,
    ondoLimits,
    isHybridDTF,
    savedWeights,
    areWeightsSaved,
    auctions.length,
  ])

  const exceeded = useMemo(() => {
    if (!metrics || Object.keys(ondoLimits).length === 0) return []
    return getExceededOndoLegs(getScaledLegSizes(metrics), ondoLimits)
  }, [metrics, ondoLimits])

  return { maxSafePercent, exceeded }
}

export default useOndoLimitStatus
