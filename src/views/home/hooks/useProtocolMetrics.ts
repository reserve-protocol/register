import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ChainId } from 'utils/chains'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { formatEther } from 'viem'
import { homeMetricsAtom } from '../atoms'

interface ProtocolMetricsResponse {
  tokens: {
    lastPriceUSD: string
    totalSupply: bigint
    cumulativeVolume: bigint
    transferCount: string
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
    tokens(where: { id: "0x196f4727526ea7fb1e17b2071b3d8eaa38486988" }) {
      lastPriceUSD
      totalSupply
      cumulativeVolume
      transferCount
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

        if (metrics.protocol) {
          volume += +metrics.protocol.cumulativeVolumeUSD
          marketCap += +metrics.protocol.totalRTokenUSD
          stakeRevenue += +metrics.protocol.cumulativeRSRRevenueUSD
          tvl += +metrics.protocol.totalValueLockedUSD
        }
      }

      // TODO: remove entire rsv thing
      if (data[ChainId.Mainnet].tokens[0]) {
        // Aggregate RSV
        const rsvMetrics = data[ChainId.Mainnet].tokens[0]
        const rsvMarketCapUsd =
          +formatEther(rsvMetrics.totalSupply) * +rsvMetrics.lastPriceUSD

        marketCap += rsvMarketCapUsd
        volume +=
          +formatEther(rsvMetrics.cumulativeVolume) *
          Number(rsvMetrics.lastPriceUSD)
      }

      // Set atom for cache
      setStats({ volume, marketCap, stakeRevenue, tvl })
    }
  }, [data])

  return useMemo(() => {
    return { data: stats, isLoading }
  }, [stats])
}

export default useProtocolMetrics
