import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'

// TODO: Swap to the production API once featured DTFs are available there.
const FEATURED_DTFS_URL = 'https://api-staging.reserve.org/v1/discover/featured'
const REFRESH_INTERVAL = 1000 * 60 * 10

export type FeaturedExposureToken = {
  address: Address
  symbol: string
  name?: string
  weight: number
}

export type FeaturedExposureGroup = {
  native: {
    symbol: string
    name?: string
    logo?: string
    caip2?: string
  } | null
  tokens: FeaturedExposureToken[]
  totalWeight: number
}

export type FeaturedDTFItem = IndexDTFItem & {
  video?: string
  priceChange?: {
    period?: string
    percent?: number
  }
  exposure?: FeaturedExposureGroup[]
}

export type FeaturedDTFGroup = {
  key: string
  versions: FeaturedDTFItem[]
}

type FeaturedDTFResponse = {
  order?: string[]
  items?: Record<string, any[]>
}

const normalizeWeight = (weight: unknown) => {
  if (typeof weight === 'number') return weight.toString()
  if (typeof weight === 'string') return weight
  return undefined
}

const normalizeExposure = (exposure: unknown): FeaturedExposureGroup[] => {
  if (!Array.isArray(exposure)) return []

  return exposure.map((group: any) => ({
    native: group?.native ?? null,
    tokens: Array.isArray(group?.tokens) ? group.tokens : [],
    totalWeight: typeof group?.totalWeight === 'number' ? group.totalWeight : 0,
  }))
}

const isDefaultTokenLogo = (icon: unknown) => {
  if (typeof icon !== 'string' || icon.trim() === '') return true

  const normalizedIcon = icon.toLowerCase()
  return (
    normalizedIcon.endsWith('/svgs/defaultlogo.svg') ||
    normalizedIcon.endsWith('defaultlogo.svg') ||
    normalizedIcon.includes('/defaultlogo.')
  )
}

const getBrandIcon = (item: any) =>
  [
    item.brand?.icon,
    item.brand?.dtf?.icon,
    item.brand?.logo,
    item.brand?.dtf?.logo,
    item.icon,
    item.logo,
    item.logoURI,
    item.tokenLogo,
  ].find((icon) => !isDefaultTokenLogo(icon)) ?? ''

const getBrandVideo = (item: any) =>
  item.video ?? item.brand?.video ?? item.brand?.dtf?.video ?? ''

const normalizeFeaturedItem = (item: any): FeaturedDTFItem => {
  const icon = getBrandIcon(item)
  const video = getBrandVideo(item)

  return {
    address: item.address,
    symbol: item.symbol,
    name: item.name,
    price: item.price ?? 0,
    fee: item.fee ?? 0,
    marketCap: item.marketCap ?? 0,
    chainId: item.chainId,
    basket: (item.basket ?? []).map((token: any) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      weight: normalizeWeight(token.weight),
    })),
    status: item.status ?? 'active',
    performance: item.performance ?? [],
    performancePercent: item.priceChange?.percent ?? 0,
    priceChange: item.priceChange,
    video,
    exposure: normalizeExposure(item.exposure),
    brand: {
      ...item.brand,
      video,
      ...(icon ? { icon } : {}),
    },
  }
}

const useFeaturedDtfs = () => {
  return useQuery({
    queryKey: ['featured-dtfs'],
    queryFn: async (): Promise<FeaturedDTFGroup[]> => {
      const response = await fetch(FEATURED_DTFS_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch featured DTFs')
      }

      const data = (await response.json()) as FeaturedDTFResponse
      const items = data.items ?? {}
      const order = data.order ?? Object.keys(items)

      return order
        .map((key) => ({
          key,
          versions: (items[key] ?? []).map(normalizeFeaturedItem),
        }))
        .filter((group) => group.versions.length > 0)
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useFeaturedDtfs
