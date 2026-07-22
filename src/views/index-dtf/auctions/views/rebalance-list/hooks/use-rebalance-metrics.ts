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

// Absent analytics coerce to 0 by design — never expose undefined/NaN.
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

// Nonce 0 (subgraph serves '0') is a real rebalance nonce — gate on `!== undefined`, never truthiness.
export const toCompletedRebalanceParams = (
  chainId: SupportedChainId,
  address: Address,
  nonce: number | string | undefined
) => (nonce !== undefined ? { chainId, address, nonce } : undefined)

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
