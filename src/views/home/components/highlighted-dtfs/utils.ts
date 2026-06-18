import { ChainId } from '@/utils/chains'
import type {
  FeaturedDTFGroup,
  FeaturedDTFItem,
} from '../../hooks/use-featured-dtfs'
import { calculatePercentageChange } from '../discover-index-dtf/utils'
import { BACKING_LIMIT } from './constants'
import type { AssetTickerItem, HighlightedDTFItem } from './types'

const CHAIN_LABELS: Record<number, string> = {
  [ChainId.Mainnet]: 'ETH',
  [ChainId.Base]: 'Base',
  [ChainId.BSC]: 'BSC',
}

const getChainLabel = (chainId: number) =>
  CHAIN_LABELS[chainId] ?? `Chain ${chainId}`

const getBasketTickerAssets = (dtf: FeaturedDTFItem): AssetTickerItem[] =>
  dtf.basket.slice(0, BACKING_LIMIT).map((token) => ({
    key: token.address,
    symbol: token.symbol,
    weight: token.weight,
  }))

const stripTokenizedSuffix = (symbol: string) => symbol.replace(/on$/, '')

const getVersionVideo = (version: FeaturedDTFItem) =>
  version.video || version.brand?.video || ''

const isDefaultTokenLogo = (icon?: string) => {
  if (!icon) return true

  const normalizedIcon = icon.toLowerCase()
  return (
    normalizedIcon.endsWith('/svgs/defaultlogo.svg') ||
    normalizedIcon.endsWith('defaultlogo.svg') ||
    normalizedIcon.includes('/defaultlogo.')
  )
}

const getVersionBrandIcon = (version: FeaturedDTFItem) =>
  isDefaultTokenLogo(version.brand?.icon) ? undefined : version.brand?.icon

const normalizeVersionMetadata = (
  version: FeaturedDTFItem,
  fallback: { brandIcon?: string; video?: string }
): FeaturedDTFItem => {
  const video = getVersionVideo(version) || fallback.video
  const brandIcon = getVersionBrandIcon(version) || fallback.brandIcon
  const brand = {
    ...version.brand,
    ...(brandIcon ? { icon: brandIcon } : {}),
    ...(video ? { video } : {}),
  }

  return {
    ...version,
    ...(video ? { video } : {}),
    brand: Object.keys(brand).length ? brand : undefined,
  }
}

export const toHighlightedDtf = (
  group: FeaturedDTFGroup
): HighlightedDTFItem | null => {
  const versions = [...group.versions].sort((a, b) => b.marketCap - a.marketCap)
  const fallback = {
    brandIcon: versions.map(getVersionBrandIcon).find(Boolean),
    video: versions.map(getVersionVideo).find(Boolean),
  }
  const normalizedVersions = versions.map((version) =>
    normalizeVersionMetadata(version, fallback)
  )
  const primaryVersion = normalizedVersions[0]

  if (!primaryVersion) return null
  if (versions.length === 1) return primaryVersion

  return {
    ...primaryVersion,
    chainVersions: normalizedVersions.map((version) => ({
      ...version,
      versionLabel: getChainLabel(version.chainId),
    })),
  }
}

export const getPaddedValueDomain = ([dataMin, dataMax]: [number, number]): [
  number,
  number,
] => {
  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
    return [dataMin, dataMax]
  }

  if (dataMin === dataMax) {
    const padding = Math.max(Math.abs(dataMin) * 0.05, 0.01)
    return [dataMin - padding, dataMax + padding]
  }

  const padding = (dataMax - dataMin) * 0.12
  return [dataMin - padding, dataMax + padding]
}

export const getPerformanceDirection = (
  performance: FeaturedDTFItem['performance']
): 'positive' | 'negative' | 'neutral' => {
  if (performance.length < 2) return 'neutral'

  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value

  if (lastValue > firstValue) return 'positive'
  if (lastValue < firstValue) return 'negative'
  return 'neutral'
}

export const formatPercentageChange = (
  dtf: FeaturedDTFItem,
  performance: FeaturedDTFItem['performance']
) => {
  if (typeof dtf.priceChange?.percent === 'number') {
    const percent = dtf.priceChange.percent
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  return calculatePercentageChange(performance)
}

export const formatPerformancePeriodLabel = (period?: string) => {
  const normalizedPeriod = period?.trim().toLowerCase()
  if (!normalizedPeriod) return '1M'

  const match = normalizedPeriod.match(/^(\d+)\s*(d|w|m|mo|y)$/)
  if (!match) return normalizedPeriod.toUpperCase()

  const [, value, unit] = match
  const labelUnit = unit === 'mo' ? 'M' : unit.toUpperCase()

  return `${value}${labelUnit}`
}

export const formatAssetWeight = (weight?: string | number) => {
  if (weight === undefined || weight === null || weight === '') return '0'

  const value = Number(weight)
  if (!Number.isFinite(value)) return String(weight)

  return value.toFixed(2).replace(/\.?0+$/, '')
}

export const getExposureTickerAssets = (
  dtf: FeaturedDTFItem
): AssetTickerItem[] => {
  if (!dtf.exposure?.length) return getBasketTickerAssets(dtf)

  const exposureAssets = dtf.exposure.flatMap((group) => {
    if (!group.native) {
      return group.tokens.map((token) => ({
        key: token.address,
        symbol: stripTokenizedSuffix(token.symbol),
        weight: token.weight,
      }))
    }

    const isExchangeGroup = ['nasdaq', 'nyse'].includes(
      group.native.caip2 ?? ''
    )

    if (isExchangeGroup) {
      return group.tokens.map((token) => ({
        key: token.address,
        symbol: stripTokenizedSuffix(token.symbol),
        weight: token.weight,
      }))
    }

    return [
      {
        key: group.native.caip2 ?? group.native.symbol,
        symbol: group.native.symbol,
        weight: group.totalWeight,
      },
    ]
  })

  return exposureAssets.length
    ? exposureAssets.slice(0, BACKING_LIMIT)
    : getBasketTickerAssets(dtf)
}
