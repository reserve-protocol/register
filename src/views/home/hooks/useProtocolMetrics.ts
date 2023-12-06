import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rpayOverviewAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { formatEther } from 'viem'

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

const statsAtom = atom({
  volume: 0,
  marketCap: 0,
  stakeRevenue: 0,
})

const aggregatedStatsAtom = atom((get) => {
  const stats = get(statsAtom)
  const thirdParty = get(rpayOverviewAtom)

  if (stats.volume) stats.volume += thirdParty.volume

  return stats
})

const useProtocolMetrics = () => {
  const setStats = useSetAtom(statsAtom)
  const stats = useAtomValue(aggregatedStatsAtom)
  const { data, isLoading } = useMultichainQuery(protocolMetricsQuery, {
    id: PROTOCOL_SLUG,
  })

  useEffect(() => {
    if (data) {
      let volume = 0
      let marketCap = 0
      let stakeRevenue = 0

      for (const chain of supportedChainList) {
        const metrics = data[chain] as ProtocolMetricsResponse

        volume += +metrics.protocol.cumulativeVolumeUSD
        marketCap += +metrics.protocol.totalRTokenUSD
        stakeRevenue += +metrics.protocol.cumulativeRSRRevenueUSD
      }

      // Aggregate RSV
      const rsvMetrics = data[ChainId.Mainnet].tokens[0]
      const rsvMarketCapUsd =
        +formatEther(rsvMetrics.totalSupply) * +rsvMetrics.lastPriceUSD

      marketCap += rsvMarketCapUsd
      volume +=
        +formatEther(rsvMetrics.cumulativeVolume) *
        Number(rsvMetrics.lastPriceUSD)

      // Set atom for cache
      setStats({ volume, marketCap, stakeRevenue })
    }
  }, [data])

  return { data: stats, isLoading }
}

export default useProtocolMetrics
