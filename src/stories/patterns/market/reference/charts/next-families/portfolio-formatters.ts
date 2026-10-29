import { formatCurrency } from '@/utils'
import type { PortfolioCategory, PortfolioPoint } from './types'
import {
  formatChartTimestamp,
  type ChartTimestampPrecision,
} from './timestamp-formatters'

export function formatCompactUsd(value: number) {
  return `$${Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`
}

export function describePortfolioPoint(
  point: PortfolioPoint,
  categories: PortfolioCategory[],
  timestampPrecision: ChartTimestampPrecision = 'day'
) {
  const categoryValues = categories
    .map(
      (category) => `${category.label} $${formatCurrency(point[category.key])}`
    )
    .join(', ')
  return `${formatChartTimestamp(point.timestamp, timestampPrecision)}, total $${formatCurrency(point.value)}, ${categoryValues}`
}
