import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { CATEGORIES, CategoryKey, DayPoint } from '../mock/ugly-cash-series'
import { shortDate } from './format'
import { PeriodPoint, UglycashData } from './uglycash-data'

const UGLYCASH_METRICS_API = `${RESERVE_API}metrics/uglycash`

type Split = Record<CategoryKey, number>

type ApiPoint = {
  volume: Split
  count: Split
  totalVolume: number
  totalCount: number
  balance: number
  partial?: boolean
}

type ApiResponse<T> = {
  generatedAt: string
  launchDate: string
  categories: CategoryKey[]
  points: (ApiPoint & T)[]
}

const getJson = async <T>(path: string): Promise<ApiResponse<T>> => {
  const res = await fetch(`${UGLYCASH_METRICS_API}/${path}`)
  if (!res.ok) throw new Error(`UGLYCASH metrics ${path}: ${res.status}`)
  return res.json()
}

const DAY = 86_400_000

const toUglycashData = (
  daily: ApiResponse<{ date: string }>,
  weeklyRes: ApiResponse<{ weekStart: string }>,
  monthlyRes: ApiResponse<{ month: string }>
): UglycashData => {
  let cumulativeVolume = 0
  let cumulativeCount = 0
  const days: DayPoint[] = daily.points.map((p) => {
    cumulativeVolume += p.totalVolume
    cumulativeCount += p.totalCount
    return {
      date: p.date,
      ts: Date.parse(`${p.date}T00:00:00Z`),
      volume: p.volume,
      count: p.count,
      totalVolume: p.totalVolume,
      totalCount: p.totalCount,
      balance: p.balance,
      texturedBalance: p.balance,
      cumulativeVolume,
      cumulativeCount,
    }
  })

  const months: PeriodPoint[] = monthlyRes.points.map((p) => ({
    month: p.month,
    volume: p.volume,
    count: p.count,
    totalVolume: p.totalVolume,
    totalCount: p.totalCount,
    partial: !!p.partial,
  }))
  const weeks: PeriodPoint[] = weeklyRes.points.map((p) => ({
    month: p.weekStart,
    volume: p.volume,
    count: p.count,
    totalVolume: p.totalVolume,
    totalCount: p.totalCount,
    partial: !!p.partial,
    label: `Week of ${shortDate(p.weekStart)}`,
  }))

  const sum = (pts: DayPoint[], key: 'totalVolume' | 'totalCount') =>
    pts.reduce((a, p) => a + p[key], 0)
  const last30 = days.slice(-30)
  const prev30 = days.slice(-60, -30)
  const last = days[days.length - 1]
  const lastTs = last.ts
  const firstTs = days[0].ts

  // Types with no activity in a metric stay out of that metric's legends, tickers and tooltips.
  const withActivity = (metric: 'volume' | 'count') =>
    CATEGORIES.filter((c) => days.some((p) => p[metric][c.key] > 0))
  const categoriesByMetric = {
    volume: withActivity('volume'),
    count: withActivity('count'),
  }
  const categories = CATEGORIES.filter(
    (c) =>
      categoriesByMetric.volume.includes(c) ||
      categoriesByMetric.count.includes(c)
  )

  return {
    source: 'api',
    status: 'ready',
    generatedAt: daily.generatedAt,
    daily: days,
    monthly: months,
    weekly: weeks,
    categories,
    categoriesByMetric,
    hidePartialPeriods: true,
    headline: {
      balance: last.balance,
      balanceStart: days[0].balance,
      volume30d: sum(last30, 'totalVolume'),
      volume30dPrev: sum(prev30, 'totalVolume'),
      count30d: sum(last30, 'totalCount'),
      cumulativeVolume,
      cumulativeCount,
      daysLive: Math.round((lastTs - firstTs) / DAY) + 1,
    },
  }
}

export const useUglycashApi = () =>
  useQuery({
    queryKey: ['uglycash-metrics'],
    queryFn: async () => {
      const [daily, weeklyRes, monthlyRes] = await Promise.all([
        getJson<{ date: string }>('daily'),
        getJson<{ weekStart: string }>('weekly'),
        getJson<{ month: string }>('monthly'),
      ])
      return toUglycashData(daily, weeklyRes, monthlyRes)
    },
    staleTime: 60 * 60 * 1000,
  })
