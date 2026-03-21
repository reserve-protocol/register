import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

const RESERVE_API = 'https://api.reserve.org/'

type Performance = { timestamp: number; value: number }

export type IndexDTFItem = {
  address: Address
  symbol: string
  name: string
  price: number
  fee: number
  marketCap: number
  basket: { address: Address; symbol: string; name?: string; weight?: string }[]
  performance: Performance[]
  performancePercent: number
  chainId: number
  status: 'active' | 'deprecated'
  brand?: {
    icon?: string
    cover?: string
    tags?: string[]
  }
}

const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: async (): Promise<IndexDTFItem[]> => {
      const response = await fetch(`${RESERVE_API}discover/dtfs?performance=true&brand=true`)

      if (!response.ok) {
        throw new Error('Failed to fetch dtf list')
      }

      const data = await response.json()

      return data
        .filter((item: any) => item.type === 'index')
        .map((item: any) => ({
          address: item.address,
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          fee: item.fee,
          marketCap: item.marketCap,
          chainId: item.chainId,
          basket: item.basket,
          status: item.status ?? 'active',
          performance: item.performance ?? [],
          performancePercent: 0,
          brand: item.brand,
        }))
        .sort((x: IndexDTFItem, y: IndexDTFItem) => y.marketCap - x.marketCap)
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
