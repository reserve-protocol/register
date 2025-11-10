import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

type Performance = { timestamp: number; value: number }

export type IndexDTFApiResponse = {
  address: string
  name: string
  symbol: string
  marketCap: number
  fee: number
  basket: {
    address: string
    symbol: string
    name: string
    weight: string
  }[]
  price: number
  performance: {
    value: number
    timestamp: number
  }[]
  chainId: number
  brand?: {
    icon?: string
    cover?: string
    tags?: string[]
    about?: string
  }
  mandate: string
}

export type IndexDTFItem = {
  address: Address
  symbol: string
  name: string
  mandate: string
  price: number
  fee: number
  marketCap: number
  basket: { address: Address; symbol: string; name?: string; weight?: string }[]
  performance: Performance[]
  performancePercent: number
  chainId: number
  brand?: {
    icon?: string
    cover?: string
    tags?: string[]
  }
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

export const indexDTFListChains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]

// TODO: Top 50 only, worry about pagination later
// TODO: Pagination may become a problem sooner? need to fetch analytics/pricing here as well!
export const getIndexDTFList = async (): Promise<IndexDTFItem[]> => {
  const fetchDTFList = async (chain: number) => {
    const response = await fetch(
      `${RESERVE_API}discover/dtf?chainId=${chain}&limit=50`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch dtf list')
    }

    const data = await response.json()

    return data.map((item: IndexDTFApiResponse) => ({
      ...item,
      performancePercent: calculatePercentageChange(item.performance),
      performance: [
        ...item.performance,
        {
          timestamp: Date.now(),
          value: item.price,
        },
      ],
    })) as IndexDTFItem[]
  }

  const responses = await Promise.all(indexDTFListChains.map(fetchDTFList))

  return responses.flat().sort((x, y) => y.marketCap - x.marketCap)
}

const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: getIndexDTFList,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
