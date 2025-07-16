import { chainIdAtom } from '@/state/atoms'
import {
  iTokenAddressAtom,
  indexDTFRebalanceControlAtom,
} from '@/state/dtf/atoms'
import { useQuery } from '@tanstack/react-query'
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

// API Response Types
interface RebalanceApiToken {
  address: string
  name: string
  decimals: number
}

interface RebalanceApiBid {
  id: string
  bidder: string
  sellToken: RebalanceApiToken
  buyToken: RebalanceApiToken
  sellAmount: string
  buyAmount: string
  transactionHash: string
  blockNumber: number
  timestamp: number
  sellTokenPrice: number
  buyTokenPrice: number
  sellAmountUsd: number
  buyAmountUsd: number
  priceImpactUsd: number
  priceImpactPercent: number
  price: number
}

interface RebalanceApiAuction {
  id: string
  startTime: number
  endTime: number
  bids: RebalanceApiBid[]
  totalSellAmountUsd: number
  totalBuyAmountUsd: number
  totalPriceImpactUsd: number
  avgPriceImpactPercent: number
}

interface RebalanceApiResponse {
  id: string
  nonce: number
  timestamp: number
  availableUntil: number
  blockNumber: number
  tokens: RebalanceApiToken[]
  auctions: RebalanceApiAuction[]
  // Analytics fields are optional (not present when no auctions)
  totalSellAmountUsd?: number
  totalBuyAmountUsd?: number
  totalPriceImpactUsd?: number
  avgPriceImpactPercent?: number
  rebalanceGainLossUsd?: number
  rebalanceGainLossPercent?: number
  totalRebalancedUsd?: number
  totalBidsCount?: number
  marketCapAtStart?: number
  trackingBasketDeviation?: number
  nativeBasketDeviation?: number
  rebalanceAccuracy?: number
  marketCapRebalanceImpact?: number
}

/**
 * Hook to fetch rebalance metrics from the API
 */
export const useRebalanceMetrics = (proposalId: string) => {
  const chainId = useAtomValue(chainIdAtom)
  const dtfAddress = useAtomValue(iTokenAddressAtom)
  const rebalancesByProposal = useAtomValue(rebalancesByProposalAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isTrackingDTF = !rebalanceControl?.weightControl

  const rebalanceData = rebalancesByProposal?.[proposalId]

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: [
      'rebalance-metrics',
      chainId,
      dtfAddress,
      rebalanceData?.rebalance.nonce,
    ],
    queryFn: async () => {
      if (!rebalanceData?.rebalance.nonce) {
        throw new Error('Nonce not found for rebalance')
      }

      const response = await fetch(
        `https://api-staging.reserve.org/dtf/rebalance?chainId=${chainId}&address=${dtfAddress}&nonce=${rebalanceData.rebalance.nonce}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch rebalance metrics')
      }

      const data: RebalanceApiResponse[] = await response.json()

      // The API returns an array, we want the first item
      return data[0] || null
    },
    enabled: !!chainId && !!dtfAddress && !!rebalanceData?.rebalance.nonce,
  })

  const metrics: RebalanceMetrics | null = apiResponse
    ? {
        timestamp: apiResponse.timestamp,
        auctionsRun: apiResponse.auctions.length,
        totalRebalancedUsd: apiResponse.totalRebalancedUsd ?? 0,
        priceImpact: apiResponse.avgPriceImpactPercent ?? 0,
        totalPriceImpactUsd: apiResponse.totalPriceImpactUsd ?? 0,
        rebalanceAccuracy: Math.min(100, apiResponse.rebalanceAccuracy ?? 0),
        deviationFromTarget: Math.abs(
          isTrackingDTF
            ? (apiResponse.trackingBasketDeviation ?? 0)
            : (apiResponse.nativeBasketDeviation ?? 0)
        ),
        marketCapRebalanceImpact: apiResponse.marketCapRebalanceImpact ?? 0,
      }
    : null

  return { loading: isLoading, metrics }
}
