import type { IndexDTFItem } from '@/hooks/useIndexDTFList'
import type { Address } from 'viem'

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
  createdAt?: number
  video?: string
  priceChange?: {
    period?: string
    percent?: number
  }
  exposure?: FeaturedExposureGroup[]
}

export type ChartPlacement = 'body' | 'header'

export type AssetTickerItem = {
  key: string
  symbol: string
  weight?: string | number
}

export type ChainVersion = FeaturedDTFItem & {
  versionLabel: string
}

export type HighlightedDTFItem = FeaturedDTFItem & {
  chainVersions?: ChainVersion[]
}
