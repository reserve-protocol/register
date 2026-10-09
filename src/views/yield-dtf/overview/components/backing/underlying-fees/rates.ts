import { formatToSignificantDigits, formatUSD } from '@/utils'
import type { FeeCategory, FeeRate } from './api'

export type CategoryRate = { rate: number; basis: FeeRate['basis'] }

export const FEE_CATEGORIES: FeeCategory[] = [
  'management',
  'performance',
  'protocol',
]

// Mirrors the backend: management scales with the whole position, the others
// average over the capital that earns interest (idle capital excluded).
export const getCategoryRates = (
  rates: FeeRate[]
): Record<FeeCategory, CategoryRate | null> => {
  const result = {} as Record<FeeCategory, CategoryRate | null>

  for (const category of FEE_CATEGORIES) {
    const rows = rates.filter((r) => r.category === category)

    if (!rows.length) {
      result[category] = null
      continue
    }

    const weighted = rows.reduce((acc, r) => acc + r.rate * r.weight, 0)
    const totalWeight = rows.reduce((acc, r) => acc + r.weight, 0)
    const rate =
      category === 'management'
        ? weighted
        : totalWeight > 0
          ? weighted / totalWeight
          : 0

    result[category] = { rate, basis: rows[0].basis }
  }

  return result
}

export const groupRateLayers = (rates: FeeRate[]) => {
  const isZeroMarket = (r: FeeRate) =>
    r.category === 'protocol' &&
    r.layer.kind === 'morpho-blue-market' &&
    r.rate === 0

  const layers = rates
    .filter((r) => !isZeroMarket(r))
    .sort(
      (a, b) =>
        FEE_CATEGORIES.indexOf(a.category) -
          FEE_CATEGORIES.indexOf(b.category) || b.weight - a.weight
    )

  return { layers, zeroRateMarkets: rates.filter(isZeroMarket).length }
}

export const formatRatePercent = (rate: number) =>
  rate.toLocaleString('en-US', { style: 'percent', maximumFractionDigits: 2 })

export const formatFeeUsd = (value: number) =>
  value > 0 && value < 0.01
    ? `$${formatToSignificantDigits(value, 2)}`
    : formatUSD(value)
