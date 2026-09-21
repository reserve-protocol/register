import { MetricLineChart } from './metric-line-chart'
import type { HistoricalMetric } from './types'

export function YieldPricePilot({ metric }: { metric: HistoricalMetric }) {
  return <MetricLineChart metric={metric} isPricePilot />
}
