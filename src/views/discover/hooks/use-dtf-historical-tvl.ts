import { ChainId } from '@/utils/chains'
import { NETWORKS, RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export type DTFStatsSnapshot = {
  timestamp: number
  tvl: number
  revenue: number
}

export type DTFStats = {
  [K in keyof typeof NETWORKS]: DTFStatsSnapshot[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

export type UseIndexDTFPriceHistoryParams = {
  address?: Address
  from: number
  to: number
  interval: '1h' | '1d'
}

// TODO(jg): multichain
const useDTFHistoricalTVL = () => {
  return useQuery({
    queryKey: ['dtf-historical-tvl'],
    queryFn: async (): Promise<DTFStats> => {
      const sp = new URLSearchParams()
      sp.set('chainId', ChainId.Base.toString())

      const response = await fetch(
        `${RESERVE_API}historical/tvl?${sp.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dtf tvl history')
      }

      const series = (await response.json()) as DTFStatsSnapshot[]

      return { base: series }
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useDTFHistoricalTVL
