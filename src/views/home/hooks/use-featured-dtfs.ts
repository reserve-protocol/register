import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import {
  type IndexDTFItem,
  type IndexDtfExposureGroup,
  type IndexDtfExposureToken,
} from '@/hooks/useIndexDTFList'
import { dateToUnix } from '@/utils'

// TODO: Swap to the production API once featured DTFs are available there.
const FEATURED_DTFS_URL = 'https://api-staging.reserve.org/v1/discover/featured'
const REFRESH_INTERVAL = 1000 * 60 * 10

export type FeaturedExposureToken = IndexDtfExposureToken
export type FeaturedExposureGroup = IndexDtfExposureGroup

export type FeaturedDTFItem = IndexDTFItem & {
  createdAt?: number
  video?: string
}

export type FeaturedDTFGroup = {
  key: string
  versions: FeaturedDTFItem[]
}

type FeaturedDTFResponse = {
  order?: string[]
  items?: Record<string, unknown[]>
}

const normalizeWeight = (weight: unknown) => {
  if (typeof weight === 'number') return weight.toString()
  if (typeof weight === 'string') return weight
  return undefined
}

const normalizeExposure = (exposure: unknown): FeaturedExposureGroup[] => {
  if (!Array.isArray(exposure)) return []

  return exposure.map((group) => {
    const raw = group as Record<string, unknown>
    const rawNative = raw.native as Record<string, unknown> | null | undefined
    const native = rawNative
      ? {
          symbol: String(rawNative.symbol),
          name:
            typeof rawNative.name === 'string' ? rawNative.name : undefined,
          logo:
            typeof rawNative.logo === 'string' ? rawNative.logo : undefined,
          caip2:
            typeof rawNative.caip2 === 'string' ? rawNative.caip2 : undefined,
        }
      : null

    const rawTokens = Array.isArray(raw.tokens) ? raw.tokens : []
    const tokens = rawTokens.map((token) => {
      const t = token as Record<string, unknown>
      return {
        address: String(t.address),
        symbol: String(t.symbol),
        name: typeof t.name === 'string' ? t.name : undefined,
        weight: typeof t.weight === 'number' ? t.weight : 0,
        marketCap:
          typeof t.marketCap === 'number' ? t.marketCap : undefined,
        change: typeof t.change === 'number' ? t.change : undefined,
        bridge: t.bridge,
      }
    })

    return {
      native,
      tokens,
      totalWeight:
        typeof raw.totalWeight === 'number' ? raw.totalWeight : 0,
      change: typeof raw.change === 'number' ? raw.change : undefined,
      hasNewlyAdded:
        typeof raw.hasNewlyAdded === 'boolean'
          ? raw.hasNewlyAdded
          : undefined,
      marketCap:
        typeof raw.marketCap === 'number' ? raw.marketCap : undefined,
    }
  })
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

const getBrandIcon = (item: unknown): string => {
  const raw = item as Record<string, unknown>
  const brand = (raw.brand as Record<string, unknown> | undefined) ?? {}
  const dtf = (brand.dtf as Record<string, unknown> | undefined) ?? {}

  return (
    [
      brand.icon,
      dtf.icon,
      brand.logo,
      dtf.logo,
      raw.icon,
      raw.logo,
      raw.logoURI,
      raw.tokenLogo,
    ].find((icon): icon is string =>
      typeof icon === 'string' && !isDefaultTokenLogo(icon)
    ) ?? ''
  )
}

const getBrandVideo = (item: unknown) => {
  const raw = item as Record<string, unknown>
  const brand = (raw.brand as Record<string, unknown> | undefined) ?? {}
  const dtf = (brand.dtf as Record<string, unknown> | undefined) ?? {}

  return (
    (raw.video as string | undefined) ??
    (brand.video as string | undefined) ??
    (dtf.video as string | undefined) ??
    ''
  )
}

const normalizeFeaturedItem = (item: unknown): FeaturedDTFItem => {
  const raw = item as Record<string, unknown>
  const icon = getBrandIcon(raw)
  const video = getBrandVideo(raw)
  const createdAt =
    typeof raw.createdAt === 'number'
      ? raw.createdAt
      : typeof raw.createdAt === 'string' && raw.createdAt.trim()
        ? dateToUnix(raw.createdAt)
        : undefined

  const rawBasket = Array.isArray(raw.basket) ? raw.basket : []
  const basket = rawBasket.map((token) => {
    const t = token as Record<string, unknown>
    return {
      address: String(t.address) as Address,
      symbol: String(t.symbol),
      name: typeof t.name === 'string' ? t.name : undefined,
      weight: normalizeWeight(t.weight),
    }
  })

  const rawPerformance = Array.isArray(raw.performance) ? raw.performance : []
  const performance = rawPerformance.map((point) => {
    const p = point as Record<string, unknown>
    return {
      timestamp: typeof p.timestamp === 'number' ? p.timestamp : 0,
      value: typeof p.value === 'number' ? p.value : 0,
    }
  })

  const rawPriceChange =
    raw.priceChange !== null && typeof raw.priceChange === 'object'
      ? (raw.priceChange as Record<string, unknown>)
      : undefined
  const priceChange: FeaturedDTFItem['priceChange'] = rawPriceChange
    ? {
        period:
          typeof rawPriceChange.period === 'string'
            ? rawPriceChange.period
            : undefined,
        displayPeriod:
          typeof rawPriceChange.displayPeriod === 'string'
            ? rawPriceChange.displayPeriod
            : undefined,
        percent:
          typeof rawPriceChange.percent === 'number'
            ? rawPriceChange.percent
            : undefined,
      }
    : undefined

  const rawBrand =
    raw.brand !== null && typeof raw.brand === 'object'
      ? (raw.brand as Record<string, unknown>)
      : undefined
  const brand: FeaturedDTFItem['brand'] = {
    icon: icon || undefined,
    cover:
      typeof rawBrand?.cover === 'string' ? rawBrand.cover : undefined,
    video,
    tags: Array.isArray(rawBrand?.tags)
      ? (rawBrand.tags as string[])
      : undefined,
  }

  return {
    address: String(raw.address) as Address,
    symbol: String(raw.symbol),
    name: String(raw.name),
    price: typeof raw.price === 'number' ? raw.price : 0,
    fee: typeof raw.fee === 'number' ? raw.fee : 0,
    marketCap: typeof raw.marketCap === 'number' ? raw.marketCap : 0,
    chainId: typeof raw.chainId === 'number' ? raw.chainId : 0,
    basket,
    status:
      typeof raw.status === 'string'
        ? (raw.status as FeaturedDTFItem['status'])
        : 'active',
    performance,
    performancePercent: priceChange?.percent ?? 0,
    createdAt,
    priceChange,
    video,
    exposure: normalizeExposure(raw.exposure),
    brand,
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
