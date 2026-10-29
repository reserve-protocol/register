import { useMemo, useState } from 'react'
import {
  CATEGORIES,
  CategoryKey,
  OUTLIER_DATE,
  Range,
  SERIES,
  sliceRange,
  sumRange,
  weekly,
} from '../mock/ugly-cash-series'

export type Metric = 'volume' | 'count'

export const RANGE_LABEL: Record<Range, string> = {
  '7D': 'last 7 days',
  '30D': 'last 30 days',
  '6M': 'last 6 months',
  YTD: 'this year',
  All: 'since launch',
}

export function useActivity(initialRange: Range = 'All') {
  const [range, setRange] = useState<Range>(initialRange)
  const [metric, setMetric] = useState<Metric>('volume')
  const [focus, setFocus] = useState<CategoryKey | null>(null)

  return useMemo(() => {
    const days = sliceRange(range)
    const isDaily = range === '7D' || range === '30D'
    const points = isDaily ? days : weekly(days)
    const rows = points.map((p) => {
      const row: Record<string, number | string> = { date: p.date }
      for (const c of CATEGORIES) row[c.key] = p[metric][c.key]
      row.total = metric === 'volume' ? p.totalVolume : p.totalCount
      return row
    })
    const total = sumRange(days, metric)
    const byCategory = CATEGORIES.map((c) => ({
      ...c,
      value: days.reduce((a, p) => a + p[metric][c.key], 0),
    })).sort((a, b) => b.value - a.value)
    const outlierIndex =
      metric === 'volume' ? rows.findIndex((r) => r.date === OUTLIER_DATE) : -1

    return {
      range,
      setRange,
      metric,
      setMetric,
      focus,
      setFocus,
      rows,
      total,
      byCategory,
      isDaily,
      outlierDate: outlierIndex >= 0 && isDaily ? OUTLIER_DATE : null,
      firstDate: SERIES[0].date,
    }
  }, [range, metric, focus])
}

export type Activity = ReturnType<typeof useActivity>
