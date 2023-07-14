import { gql } from 'graphql-request'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import {
  RSVOverview,
  chainIdAtom,
  rTokenPriceAtom,
  rpayOverviewAtom,
  rsrPriceAtom,
} from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'
import { EUSD_ADDRESS } from 'utils/addresses'
import { TIME_RANGES } from 'utils/constants'
import useQuery from './useQuery'
import useTimeFrom from './useTimeFrom'
import { formatEther } from 'viem'

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

const useTokenStats = (rTokenId: string, isRSV = false): TokenStats => {
  const [stats, setStats] = useAtom(tokenMetricsAtom)
  const resetStats = useResetAtom(tokenMetricsAtom)
  const rpayOverview = useAtomValue(rpayOverviewAtom)
  const fromTime = useTimeFrom(TIME_RANGES.DAY)
  const chainId = useAtomValue(chainIdAtom)

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

      if (rTokenId.toLowerCase() === EUSD_ADDRESS[chainId].toLowerCase()) {
        tokenData.transferCount += rpayOverview.txCount
        tokenData.cumulativeVolumeUsd = `$${formatCurrency(
          volumeUsd + rpayOverview.volume,
          0
        )}`
        tokenData.dailyVolume = `$${formatCurrency(
          dailyVolume + rpayOverview.dayVolume,
          0
        )}`
        tokenData.dailyTransferCount =
          tokenData.dailyTransferCount + rpayOverview.dayTxCount
      }

      setStats(tokenData)
    }
  }, [JSON.stringify(data), rTokenPrice, rpayOverview])

  useEffect(() => resetStats, [rTokenId])

  return stats
}

export default useTokenStats
