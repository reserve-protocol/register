import monthly from './fixtures/monthly-daily.json'
import dense from './fixtures/monthly-hourly.json'
import weekly from './fixtures/weekly-hourly.json'
import type { PerformanceDirection } from '@/utils/chart-performance-colors'

export type ChartRange = '7D' | '1M'
export type ChartScenario =
  | 'captured'
  | 'neutral'
  | 'zero'
  | 'estimated'
  | 'loading'
  | 'empty'
  | 'unavailable'
  | 'delayed'
  | 'gapped'
  | 'single'
  | 'two'
  | 'long'
export interface ChartPoint {
  timestamp: number
  value: number
  valueLabel: string
  timeLabel: string
  axisLabel: string
  estimated?: boolean
  breakBefore?: boolean
}
export interface ChartSample {
  name: string
  range: ChartRange
  points: ChartPoint[]
  domain: [number, number]
  axisValues: [string, string, string]
  direction: PerformanceDirection
  scenario: ChartScenario
  simulated: boolean
}

const priceLabel = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)

const toPoint = ([timestamp, value]: number[]): ChartPoint => ({
  timestamp,
  value,
  valueLabel: priceLabel(value),
  timeLabel: `${new Date(timestamp * 1000).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`,
  axisLabel: new Date(timestamp * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }),
})

export const CAPTURED_MONTH = monthly.points.map(toPoint)
export const CAPTURED_DENSE = dense.points.map(toPoint)
export const CAPTURED_WEEK = weekly.points.map(toPoint)

export function chartSample(
  range: ChartRange,
  scenario: ChartScenario
): ChartSample {
  const base: ChartSample = {
    name: 'LCAP',
    range,
    points: range === '1M' ? CAPTURED_MONTH : CAPTURED_WEEK,
    domain: range === '1M' ? [5, 7.2] : [6.5, 7.1],
    axisValues:
      range === '1M'
        ? ['$7.20', '$6.10', '$5.00']
        : ['$7.10', '$6.80', '$6.50'],
    direction: range === '1M' ? 'positive' : 'negative',
    scenario,
    simulated: scenario !== 'captured',
  }
  if (['loading', 'empty', 'unavailable'].includes(scenario))
    return { ...base, points: [] }
  if (scenario === 'single')
    return { ...base, points: [base.points.at(-1)!], direction: 'neutral' }
  if (scenario === 'two')
    return { ...base, points: [base.points[0], base.points.at(-1)!] }
  if (scenario === 'gapped')
    return {
      ...base,
      points: base.points
        .filter((_, i) => i < 10 || i >= 20)
        .map((p, i) => ({ ...p, breakBefore: i === 10 })),
    }
  if (scenario === 'estimated')
    return {
      ...base,
      points: base.points.map((p, i) => ({ ...p, estimated: i < 8 })),
    }
  if (scenario === 'neutral' || scenario === 'zero') {
    const value = scenario === 'zero' ? 0 : 6.63912661033878
    return {
      ...base,
      name: 'Illustrative DTF',
      direction: 'neutral',
      domain: scenario === 'zero' ? [0, 1] : [6.5, 6.8],
      axisValues:
        scenario === 'zero'
          ? ['$1.00', '$0.50', '$0.00']
          : ['$6.80', '$6.65', '$6.50'],
      points: base.points.map((p) => ({
        ...p,
        value,
        valueLabel: priceLabel(value),
      })),
    }
  }
  if (scenario === 'long')
    return {
      ...base,
      name: 'Illustrative DTF',
      direction: 'neutral',
      domain: [0, 1500000000],
      axisValues: ['$1.5B', '$750M', '$0'],
      points: base.points.map((p) => ({
        ...p,
        value: 1234567890.1234,
        valueLabel: '$1,234,567,890.1234',
      })),
    }
  return base
}
