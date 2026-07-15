import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfCompletedRebalance,
  useIndexDtfIdentity,
  type IndexDtfCompletedRebalanceDetail,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { rebalancesByProposalAtom } from '../../../atoms'

export interface RebalanceMetrics {
  timestamp: number
  auctionsRun: number
  totalRebalancedUsd: number // total dollar amount traded
  priceImpact: number // percentage
  totalPriceImpactUsd: number // total dollar amount of price impact
  rebalanceAccuracy: number // percentage
  deviationFromTarget: number // percentage
  marketCapRebalanceImpact: number // percentage
}

/**
 * Maps the SDK completed-rebalance detail to the display metrics.
 *
 * WHY: preserves the pre-migration display — genuinely-absent analytics coerce
 * to 0 (no UX regression). See M2a report: "(b) render unavailable for absent
 * analytics?" is a display-polish question for Luis; never expose undefined/NaN.
 */
export function toRebalanceMetrics(
  data: IndexDtfCompletedRebalanceDetail | undefined,
  isTrackingDTF: boolean
): RebalanceMetrics | null {
  if (!data) return null

  return {
    timestamp: data.timestamp,
    auctionsRun: data.auctions.length,
    totalRebalancedUsd: data.totalRebalancedUsd ?? 0,
    priceImpact: data.avgPriceImpactPercent ?? 0,
    totalPriceImpactUsd: data.totalPriceImpactUsd ?? 0,
    rebalanceAccuracy: Math.min(100, data.rebalanceAccuracy ?? 0),
    deviationFromTarget: Math.abs(
      isTrackingDTF
        ? data.trackingBasketDeviation ?? 0
        : data.nativeBasketDeviation ?? 0
    ),
    marketCapRebalanceImpact: data.marketCapRebalanceImpact ?? 0,
  }
}

/**
 * Hook to fetch rebalance metrics from the SDK completed-rebalance read.
 */
export const useRebalanceMetrics = (proposalId: string) => {
  const { address, chainId } = useIndexDtfIdentity()
  const rebalancesByProposal = useAtomValue(rebalancesByProposalAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isTrackingDTF = !rebalanceControl?.weightControl

  const nonce = rebalancesByProposal?.[proposalId]?.rebalance.nonce

  const { data, isLoading } = useIndexDtfCompletedRebalance(
    nonce !== undefined ? { chainId, address, nonce } : undefined
  )

  return { loading: isLoading, metrics: toRebalanceMetrics(data, isTrackingDTF) }
}
