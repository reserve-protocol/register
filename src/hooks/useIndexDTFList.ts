import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

export type IndexDTFItem = {
  address: Address
  symbol: string
  name: string
  price: number
  fee: number
  basket: { address: Address; symbol: string }[]
  performance: { timestamp: number; value: number }[] // [1, 2, 3, 4, 5, 6, 7] price per day!
  chainId: number
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

      return (await response.json()) as IndexDTFItem[]
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
