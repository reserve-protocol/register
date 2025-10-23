import { useMultichainQuery } from '@/hooks/useQuery'
import { PROTOCOL_SLUG } from '@/utils/constants'
import { gql } from 'graphql-request'
import { useMemo } from 'react'

const yieldRevenueQuery = gql`
  query GetProtocolRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      totalRTokenUSD
      rsrStakedUSD
    }
  }
`

export interface YieldRevenueMetrics {
  holdersRevenueUSD: number
  stakersRevenueUSD: number
  stakersRevenueRSR: number
  totalRevenueUSD: number
  holdersPercentage: number
  stakersPercentage: number
  yieldTVL: number
  rsrStakedUSD: number
  perChain: Record<string, {
    revenue: number
    tvl: number
    holdersRevenue: number
    stakersRevenue: number
  }>
}

export const useYieldRevenue = () => {
  const { data, isLoading, error } = useMultichainQuery(
    yieldRevenueQuery,
    { id: PROTOCOL_SLUG },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const metrics = useMemo((): YieldRevenueMetrics => {
    if (!data) {
      return {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRevenueUSD: 0,
        holdersPercentage: 0,
        stakersPercentage: 0,
        yieldTVL: 0,
        rsrStakedUSD: 0,
        perChain: {}
      }
    }

    const perChain: Record<string, any> = {}

    const aggregated = Object.entries(data).reduce(
      (acc, [chainId, chainData]: [string, any]) => {
        if (chainData?.protocol) {
          const protocol = chainData.protocol
          const holdersRevenue = Number(protocol.cumulativeRTokenRevenueUSD || 0)
          const stakersRevenue = Number(protocol.cumulativeRSRRevenueUSD || 0)
          const totalRTokenUSD = Number(protocol.totalRTokenUSD || 0)
          const rsrStakedUSD = Number(protocol.rsrStakedUSD || 0)

          acc.holdersRevenueUSD += holdersRevenue
          acc.stakersRevenueUSD += stakersRevenue
          acc.stakersRevenueRSR += Number(protocol.rsrRevenue || 0)
          acc.totalRTokenUSD += totalRTokenUSD
          acc.rsrStakedUSD += rsrStakedUSD

          // Store per-chain metrics
          perChain[chainId] = {
            revenue: holdersRevenue + stakersRevenue,
            tvl: totalRTokenUSD + rsrStakedUSD,
            holdersRevenue,
            stakersRevenue
          }
        }
        return acc
      },
      {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRTokenUSD: 0,
        rsrStakedUSD: 0
      }
    )

    const totalRevenueUSD = aggregated.holdersRevenueUSD + aggregated.stakersRevenueUSD
    const yieldTVL = aggregated.totalRTokenUSD + aggregated.rsrStakedUSD

    return {
      holdersRevenueUSD: aggregated.holdersRevenueUSD,
      stakersRevenueUSD: aggregated.stakersRevenueUSD,
      stakersRevenueRSR: aggregated.stakersRevenueRSR,
      totalRevenueUSD,
      holdersPercentage: totalRevenueUSD > 0 ? (aggregated.holdersRevenueUSD / totalRevenueUSD) * 100 : 0,
      stakersPercentage: totalRevenueUSD > 0 ? (aggregated.stakersRevenueUSD / totalRevenueUSD) * 100 : 0,
      yieldTVL,
      rsrStakedUSD: aggregated.rsrStakedUSD,
      perChain
    }
  }, [data])

  return {
    data: metrics,
    isLoading,
    error
  }
}