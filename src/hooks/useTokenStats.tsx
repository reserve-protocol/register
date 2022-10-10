import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rpayOverviewAtom, rsrPriceAtom, rTokenPriceAtom } from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import useQuery from './useQuery'
import useTimeFrom from './useTimeFrom'

const rTokenMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      insurance
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
  const rpayOverview = useAtomValue(rpayOverviewAtom)
  const fromTime = useTimeFrom(TIME_RANGES.DAY)

  const { data } = useQuery(
    rTokenMetricsQuery,
    {
      id: rTokenId,
      fromTime,
    },
    { refreshInterval: 5000 }
  )
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  useEffect(() => {
    if (data?.rtoken || data?.token) {
      const insurance = +formatEther(data?.rtoken?.insurance ?? '0')
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
        insurance,
        supply,
        cumulativeVolume,
        transferCount: +data?.token.transferCount,
        dailyTransferCount:
          +data?.token.dailyTokenSnapshot[0]?.dailyEventCount || 0,
        dailyVolume: `$${formatCurrency(dailyVolume)}`,
        insuranceUsd: `$${formatCurrency(insurance * rsrPrice)}`,
        supplyUsd: `$${formatCurrency(supplyUsd)}`,
        cumulativeVolumeUsd: `$${formatCurrency(volumeUsd)}`,
      }

      if (isRSV) {
        tokenData.transferCount += rpayOverview.txCount
        tokenData.cumulativeVolumeUsd = `$${formatCurrency(
          volumeUsd + rpayOverview.volume
        )}`
        ;(tokenData.dailyVolume = `$${formatCurrency(
          dailyVolume + rpayOverview.dayVolume
        )}`),
          (tokenData.dailyTransferCount =
            tokenData.dailyTransferCount + rpayOverview.dayTxCount)
      }

      setStats(tokenData)
    }
  }, [JSON.stringify(data), rTokenPrice, rpayOverview])

  return stats
}

export default useTokenStats
