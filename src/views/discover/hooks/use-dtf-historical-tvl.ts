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

const useDTFHistoricalTVL = () => {
  return useQuery({
    queryKey: ['dtf-historical-tvl'],
    queryFn: async (): Promise<DTFStats> => {
      const f = async (chain: number) => {
        const sp = new URLSearchParams()
        sp.set('chainId', chain.toString())

        const response = await fetch(
          `${RESERVE_API}historical/tvl?${sp.toString()}`
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dtf tvl history for chain id: ${chain}`
          )
        }
        const series = (await response.json()) as DTFStatsSnapshot[]
        return series
      }

      const [base, ethereum] = await Promise.all(
        [ChainId.Base, ChainId.Mainnet].map(f)
      )

      return { base, ethereum }
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useDTFHistoricalTVL
