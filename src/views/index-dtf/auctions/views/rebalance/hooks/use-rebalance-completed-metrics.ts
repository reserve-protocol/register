import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { RebalanceMetrics } from '../../rebalance-list/hooks/use-rebalance-metrics'
import { apiRebalanceMetricsAtom, isCompletedAtom } from '../../../atoms'
import { rebalanceMetricsAtom } from '../atoms'
import { useTotalValueTraded } from './use-total-value-traded'

/**
 * Hook that provides rebalance metrics with fallback logic
 * - Uses API metrics when rebalance is completed and data is available
 * - Falls back to local calculated metrics when API unavailable
 * - Maps local metrics to API format for consistent interface
 */
export const useRebalanceCompletedMetrics = ():
  | RebalanceMetrics
  | undefined => {
  const apiMetrics = useAtomValue(apiRebalanceMetricsAtom)
  const localMetrics = useAtomValue(rebalanceMetricsAtom)
  const isCompleted = useAtomValue(isCompletedAtom)
  const totalValueTraded = useTotalValueTraded()

  return useMemo(() => {
    // If we have API metrics and rebalance is completed, use them
    if (apiMetrics) {
      return apiMetrics
    }

    // Otherwise, build metrics from local data
    if (!localMetrics) {
      return undefined
    }

    // Map local metrics to API format
    // Note: Some fields are not available until rebalance completion
    const fallbackMetrics: RebalanceMetrics = {
      timestamp: Math.floor(Date.now() / 1000), // Current timestamp as fallback
      auctionsRun: 0, // Would need to count auctions
      totalRebalancedUsd: totalValueTraded, // Calculated from auction bids
      priceImpact: 0, // Not available until completion (will show as "Not available" in UI)
      totalPriceImpactUsd: 0, // Not available until completion
      rebalanceAccuracy: localMetrics.relativeProgression || 0, // Use progression as approximation
      deviationFromTarget: 100 - (localMetrics.absoluteProgression || 0), // Calculate from progression
      marketCapRebalanceImpact: 0, // Not available until completion
    }

    return fallbackMetrics
  }, [apiMetrics, localMetrics, isCompleted, totalValueTraded])
}

export default useRebalanceCompletedMetrics
