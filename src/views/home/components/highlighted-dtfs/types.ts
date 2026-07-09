import type { FeaturedDTFItem } from '../../hooks/use-featured-dtfs'

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
