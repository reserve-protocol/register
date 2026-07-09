import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

// TODO: Swap to the production API once the optimized discover response is live.
const INDEX_DTFS_URL =
  'https://api-staging.reserve.org/v1/discover/dtfs?performance=true&brand=true'

type Performance = { timestamp: number; value: number }

type IndexDTFPriceChange = {
  period?: string
  displayPeriod?: string
  percent?: number
}

type IndexDTFListResponsePriceChange = Omit<
  IndexDTFPriceChange,
  'percent'
> & {
  percent?: number | null
}

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
  status: 'active' | 'deprecated' | 'unsupported'
  brand?: {
    icon?: string
    cover?: string
    video?: string
    tags?: string[]
  }
  priceChange?: IndexDTFPriceChange
}

type IndexDTFListResponseItem = {
  address: Address
  symbol: string
  name: string
  price?: number
  fee?: number
  marketCap?: number
  basket?: IndexDTFItem['basket']
  performance?: Performance[]
  chainId: number
  status?: IndexDTFItem['status']
  type?: string
  brand?: IndexDTFItem['brand']
  priceChange?: IndexDTFListResponsePriceChange
}

const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

const normalizePriceChange = (
  priceChange?: IndexDTFListResponsePriceChange
): IndexDTFPriceChange | undefined => {
  if (!priceChange) return undefined

  return {
    ...priceChange,
    percent:
      typeof priceChange.percent === 'number' ? priceChange.percent : undefined,
  }
}

export const normalizeIndexDtfList = (
  data: IndexDTFListResponseItem[]
): IndexDTFItem[] => {
  return data
    .filter((item) => item.type === 'index')
    .map((item) => {
      const priceChange = normalizePriceChange(item.priceChange)

      return {
        address: item.address,
        symbol: item.symbol,
        name: item.name,
        price: item.price ?? 0,
        fee: item.fee ?? 0,
        marketCap: item.marketCap ?? 0,
        chainId: item.chainId,
        basket: item.basket ?? [],
        status: item.status ?? 'active',
        performance: item.performance ?? [],
        performancePercent: priceChange?.percent ?? 0,
        brand: item.brand,
        priceChange,
      }
    })
    .sort((x, y) => y.marketCap - x.marketCap)
}

const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: async (): Promise<IndexDTFItem[]> => {
      const response = await fetch(INDEX_DTFS_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch dtf list')
      }

      const data = (await response.json()) as IndexDTFListResponseItem[]

      return normalizeIndexDtfList(data)
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
