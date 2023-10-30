import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import {
  PROTOCOL_SLUG,
  TIME_RANGES,
  TIME_RANGE_VALUE,
  supportedChainList,
} from 'utils/constants'
import { formatEther } from 'viem'
import {
  ProtocolMetricsOverview,
  protocolMetricsAtom,
} from '../atoms/metricsAtom'

const protocolMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $fromTime: Int!) {
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
    financialsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      fist: 1
      where: { timestamp_gte: $fromTime }
    ) {
      dailyVolumeUSD
    }
    usageMetricsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 1
      where: { timestamp_gte: $fromTime }
    ) {
      dailyTransactionCount
    }
  }
`

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
  financialsDailySnapshots: {
    dailyVolumeUSD: string
  }[]
  usageMetricsDailySnapshots: {
    dailyTransactionCount: string
  }[]
}

const fromTime = dayjs().unix() - TIME_RANGE_VALUE[TIME_RANGES.DAY]

const useProtocolStats = () => {
  const setMetrics = useSetAtom(protocolMetricsAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  const { data, error } = useMultichainQuery(protocolMetricsQuery, {
    id: PROTOCOL_SLUG,
    fromTime,
  })

  useEffect(() => {
    if (data) {
      const result: ProtocolMetricsOverview = {}

      for (const chain of supportedChainList) {
        const metrics = data[chain] as ProtocolMetricsResponse

        // This needs improvement, instead of the aggregated value, needs to be an aggregation of latest data
        const totalRTokenMarketUsd = +metrics.protocol.totalRTokenUSD

        result[chain] = {
          totalRTokenMarketUsd,
          tvl: +metrics.protocol.rsrStakedUSD + totalRTokenMarketUsd,
          stakersRevenue: +metrics.protocol.cumulativeRSRRevenueUSD,
          holdersRevenue: +metrics.protocol.cumulativeRTokenRevenueUSD,
          volume: +metrics.protocol.cumulativeVolumeUSD,
          transactionCount: +metrics.protocol.transactionCount,
          dailyVolume:
            +metrics.financialsDailySnapshots[0]?.dailyVolumeUSD || 0,
          dailyTransactionCount:
            +metrics.usageMetricsDailySnapshots[0]?.dailyTransactionCount || 0,
        }
      }

      // Aggregate RSV
      const rsvMetrics = data[ChainId.Mainnet].tokens[0]
      const rsvMarketCapUsd =
        +formatEther(rsvMetrics.totalSupply) * +rsvMetrics.lastPriceUSD

      result[ChainId.Mainnet].totalRTokenMarketUsd += rsvMarketCapUsd
      result[ChainId.Mainnet].tvl += rsvMarketCapUsd
      result[ChainId.Mainnet].volume +=
        +formatEther(rsvMetrics.cumulativeVolume) *
        Number(rsvMetrics.lastPriceUSD)
      result[ChainId.Mainnet].transactionCount += +rsvMetrics.transferCount

      // Set atom for cache
      setMetrics(result)
    }
  }, [data, rsrPrice])
}

export default useProtocolStats
