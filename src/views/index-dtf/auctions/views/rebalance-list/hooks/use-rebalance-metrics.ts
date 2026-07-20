import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfCompletedRebalance,
  useIndexDtfIdentity,
  type IndexDtfCompletedRebalanceDetail,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import type { Address } from 'viem'
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

// Nonce 0 (subgraph serves it as a string, '0') is a real rebalance nonce —
// gate on `!== undefined`, never truthiness (the pre-SDK hook's
// `enabled: !!nonce` bug). The SDK read accepts number | string.
export const toCompletedRebalanceParams = (
  chainId: SupportedChainId,
  address: Address,
  nonce: number | string | undefined
) => (nonce !== undefined ? { chainId, address, nonce } : undefined)

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
    toCompletedRebalanceParams(chainId, address, nonce)
  )

  return { loading: isLoading, metrics: toRebalanceMetrics(data, isTrackingDTF) }
}
