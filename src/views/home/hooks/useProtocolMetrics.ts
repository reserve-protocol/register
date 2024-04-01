import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ChainId } from 'utils/chains'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { formatEther } from 'viem'
import { homeMetricsAtom } from '../atoms'
import { rsrPriceAtom } from 'state/atoms'

type TokenMetrics = {
  id: string
  lastPriceUSD: string
  totalSupply: bigint
  cumulativeVolume: bigint
  transferCount: string
}

type ProtocolMetricsResponse = {
  tokens: TokenMetrics[]
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
    tokens(where: { totalSupply_gt: 0, lastPriceUSD_gt: 0 }, first: 1000) {
      id
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
        const tokens = data[chain].tokens as TokenMetrics[]
        const tokensMarketCap = tokens.reduce(
          (acc, token) =>
            acc + +formatEther(token.totalSupply) * +token.lastPriceUSD,
          0
        )

        if (metrics.protocol) {
          volume += +metrics.protocol.cumulativeVolumeUSD
          marketCap += tokensMarketCap
          stakeRevenue += +metrics.protocol.cumulativeRSRRevenueUSD
        }

        tvl += +formatEther(metrics.protocol.rsrStaked as any) * rsrPrice
      }

      const rsvMetrics = (data[ChainId.Mainnet].tokens as TokenMetrics[]).find(
        (t) => t.id === '0x196f4727526ea7fb1e17b2071b3d8eaa38486988'
      )

      // TODO: remove entire rsv thing
      if (rsvMetrics) {
        // Aggregate RSV
        const rsvMarketCapUsd =
          +formatEther(rsvMetrics.totalSupply) * +rsvMetrics.lastPriceUSD

        marketCap += rsvMarketCapUsd
        volume +=
          +formatEther(rsvMetrics.cumulativeVolume) *
          Number(rsvMetrics.lastPriceUSD)
      }
      tvl += marketCap

      // Set atom for cache
      setStats({ volume, marketCap, stakeRevenue, tvl })
    }
  }, [data, rsrPrice])

  return useMemo(() => {
    return { data: stats, isLoading }
  }, [stats, isLoading])
}

export default useProtocolMetrics
