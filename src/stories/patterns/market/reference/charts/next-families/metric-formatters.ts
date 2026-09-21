import { formatCurrency, formatPercentage } from '@/utils'
import type { HistoricalMetric } from './types'

export function getMetricDomain(
  metric: HistoricalMetric
): ['auto', 'auto'] | undefined {
  if (metric.id === 'price' || metric.id === 'apy') return ['auto', 'auto']
  return undefined
}

export function formatMetricValue(id: HistoricalMetric['id'], value: number) {
  if (id === 'apy') return formatPercentage(value)
  if (id === 'supply') return `${formatCurrency(value)} hyUSD`
  return `$${formatCurrency(value, id === 'price' ? 3 : 0)}`
}

export function formatMetricAxis(id: HistoricalMetric['id'], value: number) {
  if (id === 'apy') return `${formatCurrency(value, 1)}%`
  if (id === 'supply') return compact(value)
  if (id === 'price') return `$${formatCurrency(value, 4)}`
  return `$${compact(value)}`
}

function compact(value: number) {
  return Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
