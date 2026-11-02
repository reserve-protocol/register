import { createContext, useContext } from 'react'
import {
  CATEGORIES,
  CategoryKey,
  DayPoint,
  HEADLINE,
  MonthPoint,
  SERIES,
  monthly,
  weekly,
} from '../mock/ugly-cash-series'
import { shortDate } from './format'

export type PeriodPoint = MonthPoint & { label?: string }

export type UglycashData = {
  source: 'mock' | 'api'
  // Set only by live pages: 'loading' keeps data cards on skeletons until the API answers.
  status?: 'loading' | 'ready'
  generatedAt?: string
  daily: DayPoint[]
  monthly: PeriodPoint[]
  weekly: PeriodPoint[]
  categories: (typeof CATEGORIES)[number][]
  // Per metric, because a type can report transactions with no volume (savings today).
  categoriesByMetric: Record<'volume' | 'count', (typeof CATEGORIES)[number][]>
  // Partial periods (the month or week still in progress) read as a drop at the end of a growth chart.
  hidePartialPeriods: boolean
  headline: typeof HEADLINE
}

export const mockData: UglycashData = {
  source: 'mock',
  daily: SERIES,
  monthly: monthly(),
  weekly: weekly(SERIES).map((w) => ({
    month: w.date,
    volume: w.volume,
    count: w.count,
    totalVolume: w.totalVolume,
    totalCount: w.totalCount,
    partial: false,
    label: `Week of ${shortDate(w.date)}`,
  })),
  categories: [...CATEGORIES],
  categoriesByMetric: { volume: [...CATEGORIES], count: [...CATEGORIES] },
  hidePartialPeriods: false,
  headline: HEADLINE,
}

const UglycashDataContext = createContext<UglycashData>(mockData)

export const UglycashDataProvider = UglycashDataContext.Provider

export const useUglycashData = () => useContext(UglycashDataContext)

export const activeCategoryKeys = (data: UglycashData): CategoryKey[] =>
  data.categories.map((c) => c.key)
