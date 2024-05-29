import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useMemo } from 'react'
import { getUTCStartOfDay } from 'utils'
import { CHAIN_TO_NETWORK, NETWORKS, supportedChainList } from 'utils/constants'

const protocolMetricsQuery = gql`
  query {
    dailyStats: financialsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      timestamp
      totalValueLockedUSD
    }
  }
`
type ProtocolMetricsResponse = {
  dailyStats: {
    timestamp: number
    totalValueLockedUSD: string
  }[]
}

type DailyTVL = {
  day: number
} & {
  [K in keyof typeof NETWORKS]: number
}

const DEFAULT_TVL_BY_CHAIN = Object.keys(NETWORKS).reduce((obj, network) => {
  obj[network] = 0
  return obj
}, {} as Record<keyof typeof NETWORKS, number>)

const useHistoricalTVL = (): DailyTVL[] => {
  const { data } = useMultichainQuery(protocolMetricsQuery)

  const historicalTVL = useMemo(() => {
    if (!data) return []

    // sum all totalValueLockedUSD per day, per chain
    const tvlPerDay = supportedChainList
      .flatMap((chain) => {
        const metrics = data[chain] as ProtocolMetricsResponse
        return metrics?.dailyStats.map(({ totalValueLockedUSD, timestamp }) => ({
          totalValueLockedUSD,
          chain,
          day: getUTCStartOfDay(timestamp),
        })) || []
      })
      .reduce((acc, { totalValueLockedUSD, day, chain }) => {
        if (!acc[day]) {
          acc[day] = {
            day,
            ...DEFAULT_TVL_BY_CHAIN,
          }
        }
        acc[day] = {
          ...acc[day],
          [CHAIN_TO_NETWORK[chain]]: +totalValueLockedUSD,
        }
        return acc
      }, {} as Record<string, DailyTVL>)
    return Object.values(tvlPerDay).sort((a, b) => a.day - b.day)
  }, [data])

  return historicalTVL
}

export default useHistoricalTVL
