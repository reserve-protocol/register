import { performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { ApyDataPoint } from '../../hooks/use-dtf-apy-history'
import { DataType, historicalConfigs } from './price-chart-constants'

export const dataTypeAtom = atom<DataType>('price')

// Raw APY history payload, synced from useIndexDTFApyHistory inside PriceChart.
// Keeping it in an atom lets other components (chart-overlay) derive the same
// timeseries and stats without prop drilling.
export const apyHistoryAtom = atom<ApyDataPoint[] | undefined>(undefined)

// APY points filtered by the currently selected time range.
export const apyTimeseriesAtom = atom<ApyDataPoint[]>((get) => {
  const history = get(apyHistoryAtom)
  const range = get(performanceTimeRangeAtom)
  if (!history) return []
  const rangeFrom = range === 'all' ? 0 : (historicalConfigs[range]?.from ?? 0)
  return history.filter((d) => d.timestamp >= rangeFrom)
})

// Average APY across the active range — read by the chart reference line.
export const avgApyAtom = atom((get) => {
  const series = get(apyTimeseriesAtom)
  if (series.length === 0) return 0
  return series.reduce((sum, d) => sum + d.totalAPY, 0) / series.length
})

// Avg/min/max over the active APY timeseries. Null when there's no data so
// consumers can skip rendering without an extra length check.
export const apyStatsAtom = atom((get) => {
  const series = get(apyTimeseriesAtom)
  if (series.length === 0) return null

  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (const d of series) {
    sum += d.totalAPY
    if (d.totalAPY < min) min = d.totalAPY
    if (d.totalAPY > max) max = d.totalAPY
  }
  return { avg: sum / series.length, min, max }
})
