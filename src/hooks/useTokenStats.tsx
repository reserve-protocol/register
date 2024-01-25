import { gql } from 'graphql-request'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { rTokenPriceAtom, rsrPriceAtom } from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { RSVOverview } from 'utils/rsv'
import { formatEther } from 'viem'
import useQuery from './useQuery'
import useTimeFrom from './useTimeFrom'

const rTokenMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      rsrStaked
    }
    token(id: $id) {
      totalSupply
      transferCount
      cumulativeVolume
      lastPriceUSD
      dailyTokenSnapshot(
        orderBy: timestamp
        orderDirection: desc
        first: 1
        where: { timestamp_gte: $fromTime }
      ) {
        dailyVolume
        dailyEventCount
      }
    }
  }
`

const lastFetchedStatsAtom = atom('')

const useTokenStats = (rTokenId: string, isRSV = false): TokenStats => {
  const [stats, setStats] = useAtom(tokenMetricsAtom)
  const resetStats = useResetAtom(tokenMetricsAtom)
  const fromTime = useTimeFrom(TIME_RANGES.DAY)
  const [lastFetched, setLastFetched] = useAtom(lastFetchedStatsAtom)

  const { data } = useQuery(rTokenMetricsQuery, {
    id: rTokenId,
    fromTime,
  })

  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  useEffect(() => {
    if (data?.rtoken || data?.token) {
      const staked = +formatEther(data?.rtoken?.rsrStaked ?? '0')
      const supply = +formatEther(data?.token.totalSupply)
      const cumulativeVolume = +formatEther(data?.token.cumulativeVolume)
      const dailyVolume = +formatEther(
        data?.token.dailyTokenSnapshot[0]?.dailyVolume ?? '0'
      )
      const supplyUsd = isRSV
        ? supply * +data?.token.lastPriceUSD
        : supply * rTokenPrice
      const volumeUsd = isRSV
        ? cumulativeVolume * +data?.token.lastPriceUSD
        : cumulativeVolume * rTokenPrice

      const tokenData = {
        staked,
        supply,
        cumulativeVolume,
        transferCount: +data?.token.transferCount,
        dailyTransferCount:
          +data?.token.dailyTokenSnapshot[0]?.dailyEventCount || 0,
        dailyVolume: `$${formatCurrency(dailyVolume, 0)}`,
        stakedUsd: `$${formatCurrency(staked * rsrPrice, 0)}`,
        supplyUsd: `$${formatCurrency(supplyUsd, 0)}`,
        cumulativeVolumeUsd: `$${formatCurrency(volumeUsd, 0)}`,
      }

      if (isRSV) {
        tokenData.transferCount += RSVOverview.txCount
        tokenData.cumulativeVolumeUsd = `$${formatCurrency(
          volumeUsd + RSVOverview.volume,
          0
        )}`
      }

      setLastFetched(rTokenId)
      setStats(tokenData)
    }
  }, [JSON.stringify(data), rTokenPrice])

  useEffect(() => {
    if (rTokenId !== lastFetched) {
      resetStats()
    }
  }, [rTokenId])

  return stats
}

export default useTokenStats
