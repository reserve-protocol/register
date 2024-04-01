import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { ChainId } from 'utils/chains'
import { PROTOCOL_SLUG, supportedChainList } from 'utils/constants'
import { formatEther } from 'viem'
import { homeMetricsAtom } from '../atoms'
import { rsrPriceAtom } from 'state/atoms'

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

type TokenMetrics = {
  tokens: {
    lastPriceUSD: string
    totalSupply: bigint
  }[]
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

const tokensQuery = gql`
  query GetTokens {
    tokens(where: { totalSupply_gt: 0, lastPriceUSD_gt: 0 }, first: 1000) {
      totalSupply
      lastPriceUSD
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

  const { data: tokens, isLoading: isLoadingTokens } = useMultichainQuery(
    tokensQuery,
    {},
    { keepPreviousData: true }
  )

  useEffect(() => {
    if (data && tokens) {
      let volume = 0
      let marketCap = 0
      let stakeRevenue = 0
      let tvl = 0

      for (const chain of supportedChainList) {
        const metrics = data[chain] as ProtocolMetricsResponse
        const _tokens = tokens[chain] as TokenMetrics
        const tokensMarketCap = _tokens.tokens.reduce(
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
      tvl += marketCap

      // Set atom for cache
      setStats({ volume, marketCap, stakeRevenue, tvl })
    }
  }, [data, rsrPrice, tokens])

  return useMemo(() => {
    return { data: stats, isLoading: isLoading || isLoadingTokens }
  }, [stats, isLoading, isLoadingTokens])
}

export default useProtocolMetrics
