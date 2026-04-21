import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'

const METRICS_URL = `${RESERVE_API}v2/protocol/metrics/`

export type HomeMetrics = {
  tvl: number
  partnerRevenue: number
  rsrAccrual: number
  yieldDistributed: number
  mintVolume: number
}

type MetricsResponse = {
  status: string
  result: {
    tvl: number
    partnerRevenue: number
    partnerRevenueAnnualized: number
    rsrAccrual: number
    rsrAccrualAnnualized: number
    yieldDistributed: number
    yieldDistributedAnnualized: number
    mintVolume: number
  }
}

const fetchHomeMetrics = async (): Promise<HomeMetrics> => {
  const res = await fetch(METRICS_URL)
  if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.status}`)
  const json: MetricsResponse = await res.json()
  const { result } = json
  return {
    tvl: result.tvl,
    partnerRevenue: result.partnerRevenueAnnualized,
    rsrAccrual: result.rsrAccrualAnnualized,
    yieldDistributed: result.yieldDistributedAnnualized,
    mintVolume: result.mintVolume,
  }
}

export function useHomeMetrics() {
  return useQuery({
    queryKey: ['home-metrics'],
    queryFn: fetchHomeMetrics,
    staleTime: 60_000,
  })
}
