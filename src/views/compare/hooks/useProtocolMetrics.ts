import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { homeMetricsAtom } from '../atoms'

type ProtocolMetricsResponse = {
  protocol: {
    totalValueLockedUSD: string
    totalRTokenUSD: string
    cumulativeVolumeUSD: string
    cumulativeRTokenRevenueUSD: string
    cumulativeRSRRevenueUSD: string
    rsrRevenue: string
    transactionCount: string
    rsrStaked: string
    rsrStakedUSD: string
  }
}

const protocolMetricsQuery = gql`
  query GetProtocolMetrics($id: String!) {
    protocol(id: $id) {
      totalValueLockedUSD
      totalRTokenUSD
      cumulativeVolumeUSD
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      transactionCount
      rsrStaked
      rsrStakedUSD
    }
  }
`

const useProtocolMetrics = () => {
  const [stats, setStats] = useAtom(homeMetricsAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const { data, isLoading } = useMultichainQuery(
    protocolMetricsQuery,
    {
      id: PROTOCOL_SLUG,
    },
    { keepPreviousData: true }
  )

  useEffect(() => {
    if (data) {
      let volume = 0
      let marketCap = 0
      let stakeRevenue = 0
      let tvl = 0

      for (const chain of supportedChainList) {
        const metrics = data[chain] as ProtocolMetricsResponse

        if (metrics?.protocol) {
          volume += +metrics.protocol.cumulativeVolumeUSD
          marketCap += +metrics.protocol.totalRTokenUSD
          stakeRevenue += +metrics.protocol.cumulativeRSRRevenueUSD
          tvl += +metrics.protocol.totalValueLockedUSD
        }
      }

      // Set atom for cache
      setStats({ volume, marketCap, stakeRevenue, tvl })
    }
  }, [data, rsrPrice])

  return useMemo(() => {
    return { data: stats, isLoading }
  }, [stats, isLoading])
}

export default useProtocolMetrics
