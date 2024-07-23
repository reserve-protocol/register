import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { PROTOCOL_SLUG } from 'utils/constants'

type ProtocolMetricsResponse = {
  protocol: {
    totalValueLockedUSD: string
    totalRTokenUSD: string
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
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      transactionCount
      rsrStaked
      rsrStakedUSD
    }
  }
`

const DEFAULT_STATS = {
  marketCap: 0,
  stakeRevenue: 0,
  tvl: 0,
  rsrStakedUSD: 0,
  rTokenAnnualizedRevenue: 0,
  rsrStakerAnnualizedRevenue: 0,
}

const useProtocolMetrics = () => {
  const { list, isLoading: loadingList } = useTokenList()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const { data, isLoading } = useMultichainQuery(
    protocolMetricsQuery,
    {
      id: PROTOCOL_SLUG,
    },
    { keepPreviousData: true }
  )

  return useMemo(() => {
    if (isLoading || loadingList || !data || !list) {
      return { data: DEFAULT_STATS, isLoading: isLoading || loadingList }
    }

    const stats = Object.values(data)
      .flatMap((d) => d.protocol)
      .reduce(
        (acc, curr) => ({
          marketCap: acc.marketCap + +curr.totalRTokenUSD,
          stakeRevenue: acc.stakeRevenue + +curr.cumulativeRSRRevenueUSD,
          tvl: acc.tvl + +curr.totalValueLockedUSD,
          rsrStakedUSD: acc.rsrStakedUSD + +curr.rsrStakedUSD,
        }),
        DEFAULT_STATS
      )

    const rsrStakerAnnualizedRevenue = list.reduce((acc, curr) => {
      return acc + (curr.stakingApy / 100) * curr.stakeUsd
    }, 0)

    const rTokenAnnualizedRevenue = list.reduce((acc, curr) => {
      return acc + (curr.tokenApy / 100) * curr.supply
    }, 0)

    return {
      data: { ...stats, rsrStakerAnnualizedRevenue, rTokenAnnualizedRevenue },
      isLoading,
    }
  }, [data, list, isLoading, loadingList])
}

export default useProtocolMetrics
