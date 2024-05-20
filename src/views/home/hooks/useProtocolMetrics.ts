import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { homeMetricsAtom } from '../../compare/atoms'

type ProtocolMetricsResponse = {
  financialsDailySnapshots: {
    cumulativeRTokenRevenueUSD: string
    cumulativeRSRRevenueUSD: string
    timestamp: string
  }[]
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
    financialsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 10
    ) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      timestamp
    }
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
      let rsrStakedUSD = 0
      let rTokenAnnualizedRevenue = 0
      let rsrStakerAnnualizedRevenue = 0

      for (const chain of supportedChainList) {
        const metrics = data[chain] as ProtocolMetricsResponse

        if (
          metrics?.financialsDailySnapshots &&
          metrics?.financialsDailySnapshots.length > 1
        ) {
          const last = metrics.financialsDailySnapshots[0]
          const first = metrics.financialsDailySnapshots.slice(-1)[0]
          const timeDifference = +last.timestamp - +first.timestamp

          // calculate rToken revenue annualized
          const rTokenRevenueRate =
            (+last.cumulativeRTokenRevenueUSD -
              +first.cumulativeRTokenRevenueUSD) /
            timeDifference
          const annualizedRTokenRevenue = rTokenRevenueRate * 365 * 24 * 60 * 60

          // calculate RSR revenue annualized
          const rsrRevenueRate =
            (+last.cumulativeRSRRevenueUSD - +first.cumulativeRSRRevenueUSD) /
            timeDifference
          const annualizedRSRRevenue = rsrRevenueRate * 365 * 24 * 60 * 60

          rTokenAnnualizedRevenue += annualizedRSRRevenue
          rsrStakerAnnualizedRevenue += annualizedRTokenRevenue
        }

        if (metrics?.protocol) {
          volume += +metrics.protocol.cumulativeVolumeUSD
          marketCap += +metrics.protocol.totalRTokenUSD
          stakeRevenue += +metrics.protocol.cumulativeRSRRevenueUSD
          tvl += +metrics.protocol.totalValueLockedUSD
          rsrStakedUSD += +metrics.protocol.rsrStakedUSD
        }
      }

      // Set atom for cache
      setStats({
        volume,
        marketCap,
        stakeRevenue,
        tvl,
        rsrStakedUSD,
        rTokenAnnualizedRevenue,
        rsrStakerAnnualizedRevenue,
      })
    }
  }, [data, rsrPrice])

  return useMemo(() => {
    return { data: stats, isLoading }
  }, [stats, isLoading])
}

export default useProtocolMetrics
