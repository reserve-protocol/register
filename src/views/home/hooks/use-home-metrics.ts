import { useQuery } from '@tanstack/react-query'

// TODO: swap to RESERVE_API once metrics endpoint is on prod
const METRICS_URL = 'https://api-staging.reserve.org/v2/protocol/metrics/'

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
    partnerRevenue: { index: number; yield: number }
    rsrAccrual: { index: number; yield: number }
    yieldDistributed: number
    mintVolume: { index: number; yield: number }
  }
}

const fetchHomeMetrics = async (): Promise<HomeMetrics> => {
  const res = await fetch(METRICS_URL)
  if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.status}`)
  const json: MetricsResponse = await res.json()
  const { result } = json
  return {
    tvl: result.tvl,
    partnerRevenue: result.partnerRevenue.index + result.partnerRevenue.yield,
    rsrAccrual: result.rsrAccrual.index + result.rsrAccrual.yield,
    yieldDistributed: result.yieldDistributed,
    mintVolume: result.mintVolume.index + result.mintVolume.yield,
  }
}

export function useHomeMetrics() {
  return useQuery({
    queryKey: ['home-metrics'],
    queryFn: fetchHomeMetrics,
    staleTime: 60_000,
  })
}
