import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export type IndexDTFPerformance = {
  address: Address
  timeseries: {
    timestamp: number
    price: number
  }[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

export type UseIndexDTFPriceHistoryParams = {
  address?: Address
  from: number
  to: number
  interval: '1h' | '1d'
}

const useIndexDTFPriceHistory = ({
  address,
  from,
  to,
  interval,
}: UseIndexDTFPriceHistoryParams) => {
  return useQuery({
    queryKey: ['dtf-historical-price', address, from, to, interval],
    queryFn: async (): Promise<IndexDTFPerformance> => {
      const sp = new URLSearchParams()
      sp.set('chainId', ChainId.Base.toString())
      sp.set('address', address?.toLowerCase() ?? '')
      sp.set('from', from.toString())
      sp.set('to', to.toString())
      sp.set('interval', interval)

      const response = await fetch(
        `${RESERVE_API}historical/dtf?${sp.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dtf price history')
      }

      return (await response.json()) as IndexDTFPerformance
    },
    enabled: Boolean(address),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFPriceHistory
