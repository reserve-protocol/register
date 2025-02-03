import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

type Performance = { timestamp: number; value: number }

export type IndexDTFItem = {
  address: Address
  symbol: string
  name: string
  price: number
  fee: number
  basket: { address: Address; symbol: string }[]
  performance: Performance[]
  performancePercent: number
  chainId: number
}

const calculatePercentageChange = (performance: Performance[]) => {
  if (performance.length === 0) {
    return 0
  }
  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value
  return ((lastValue - firstValue) / firstValue) * 100
}

const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

// TODO: Top 100 only, worry about pagination later
// TODO: Pagination may become a problem sooner? need to fetch analytics/pricing here as well!
// TODO: Mock data for what should come from the API
const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: async (): Promise<IndexDTFItem[]> => {
      const response = await fetch(
        `${RESERVE_API}discover/dtf?chainId=${ChainId.Base}&limit=100`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dtf list')
      }

      const data = await response.json()

      return data.map((item: any) => ({
        ...item,
        performancePercent: calculatePercentageChange(item.performance),
      })) as IndexDTFItem[]
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
