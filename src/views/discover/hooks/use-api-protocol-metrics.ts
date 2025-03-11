import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

type Response =
  | {
      status: 'success'
      result: Metrics
    }
  | {
      status: 'error'
      error: string
    }

export type Metrics = {
  marketCap: number
  tvl: number
  rsrLockedUSD: number
  rsrStakerAnnualizedRevenue: number
  rTokenAnnualizedRevenue: number
  tvlTimeseries: Series[]
}

type Series = {
  '1': number
  '8453': number
  '42161': number
  timestamp: number
}

const useAPIProtocolMetrics = () => {
  return useQuery({
    queryKey: ['api-protocol-metrics'],
    queryFn: async (): Promise<Metrics> => {
      const response = await fetch(`${RESERVE_API}protocol/metrics`)

      if (!response.ok) {
        throw new Error('Failed to fetch protocol metrics')
      }

      const result = (await response.json()) as Response
      if (result.status === 'error') {
        throw new Error('Failed to fetch protocol metrics')
      }
      return result.result
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useAPIProtocolMetrics
