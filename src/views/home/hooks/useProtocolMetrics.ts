import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import useTokenList from 'hooks/useTokenList'
import { useMemo } from 'react'
import { PROTOCOL_SLUG } from 'utils/constants'

const protocolMetricsQuery = gql`
  query GetProtocolMetrics($id: String!) {
    protocol(id: $id) {
      totalRTokenUSD
      rsrRevenue
      rsrLockedUSD
    }
  }
`

const DEFAULT_STATS = {
  marketCap: 0,
  tvl: 0,
  rsrLockedUSD: 0,
  rTokenAnnualizedRevenue: 0,
  rsrStakerAnnualizedRevenue: 0,
}

const useProtocolMetrics = () => {
  const { list, isLoading: loadingList } = useTokenList()
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
          tvl: acc.tvl + +curr.totalRTokenUSD + +curr.rsrLockedUSD,
          rsrLockedUSD: acc.rsrLockedUSD + +curr.rsrLockedUSD,
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
