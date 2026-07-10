import { useDtfSdk, type SupportedChainId } from '@reserve-protocol/react-sdk'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

const INDEX_DTFS_URL =
  'https://api.reserve.org/v1/discover/dtfs?performance=true&brand=true'

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

export type IndexDtfExposureToken = {
  address: string
  symbol: string
  name?: string
  weight: number
  marketCap?: number
  change?: number
  bridge?: unknown
}

export type IndexDtfExposureGroup = {
  native: {
    symbol: string
    name?: string
    logo?: string
    caip2?: string
  } | null
  tokens: readonly IndexDtfExposureToken[]
  totalWeight: number
  change?: number
  hasNewlyAdded?: boolean
  marketCap?: number
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
  createdAt?: number
  exposure?: readonly IndexDtfExposureGroup[]
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

const fetchIndexDtfExposures = async (
  sdk: ReturnType<typeof useDtfSdk>,
  items: IndexDTFItem[]
): Promise<Record<string, readonly IndexDtfExposureGroup[]>> => {
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const exposure = await sdk.index.getExposure({
          address: item.address,
          chainId: item.chainId as SupportedChainId,
          period: '24h',
        })

        return {
          address: item.address.toLowerCase(),
          exposure: exposure as unknown as readonly IndexDtfExposureGroup[],
        }
      } catch {
        return { address: item.address.toLowerCase(), exposure: [] }
      }
    })
  )

  return results.reduce(
    (acc, { address, exposure }) => {
      acc[address] = exposure
      return acc
    },
    {} as Record<string, readonly IndexDtfExposureGroup[]>
  )
}

const useIndexDTFList = ({
  withExposure,
}: { withExposure?: boolean } = {}) => {
  const sdk = useDtfSdk()

  return useQuery({
    queryKey: ['index-dtf-list', { withExposure }],
    queryFn: async (): Promise<IndexDTFItem[]> => {
      const response = await fetch(INDEX_DTFS_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch dtf list')
      }

      const data = (await response.json()) as IndexDTFListResponseItem[]
      const items = normalizeIndexDtfList(data)

      if (!withExposure) {
        return items
      }

      const exposureByAddress = await fetchIndexDtfExposures(sdk, items)

      return items.map((item) => ({
        ...item,
        exposure: exposureByAddress[item.address.toLowerCase()] ?? [],
      }))
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
