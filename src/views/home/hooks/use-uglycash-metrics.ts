import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { CATEGORIES, Category, CategoryKey } from '../data/categories'

const UGLYCASH_METRICS_API = `${RESERVE_API}metrics/uglycash`
const UGLYCASH_ONCHAIN_API = `${RESERVE_API}uglycash/onchain-balance`
const DAY = 86_400_000

type Split = Record<CategoryKey, number>
type Metric = 'volume' | 'count'

type ApiPoint = {
  volume: Split
  count: Split
  totalVolume: number
  totalCount: number
  balance: number
  partial?: boolean
}

type ApiSeries<T> = { generatedAt: string; points: (ApiPoint & T)[] }

export type OnchainSeries = { points: { date: string; balance: number }[] }

export type DayPoint = {
  date: string
  totalVolume: number
  totalCount: number
  balance: number
}

export type MonthPoint = {
  month: string
  volume: Split
  count: Split
  totalVolume: number
  totalCount: number
}

export type UglycashMetrics = {
  generatedAt: string
  daily: DayPoint[]
  // Complete months only: a month in progress reads as a drop at the end of a growth chart.
  monthly: MonthPoint[]
  // Per metric, because a type can report transactions with no volume.
  categories: Record<Metric, Category[]>
  headline: {
    balance: number
    cumulativeVolume: number
    cumulativeCount: number
    daysLive: number
  }
}

export const toUglycashMetrics = (
  daily: ApiSeries<{ date: string }>,
  monthly: ApiSeries<{ month: string }>
): UglycashMetrics => {
  const complete = monthly.points.filter((point) => !point.partial)
  if (!daily.points.length || !complete.length)
    throw new Error('UGLYCASH metrics: empty series')

  const sum = (key: 'totalVolume' | 'totalCount') =>
    daily.points.reduce((total, point) => total + point[key], 0)
  const first = daily.points[0]
  const last = daily.points[daily.points.length - 1]
  const withActivity = (metric: Metric) =>
    CATEGORIES.filter((category) =>
      monthly.points.some((point) => point[metric][category.key] > 0)
    )

  return {
    generatedAt: daily.generatedAt,
    daily: daily.points.map(({ date, totalVolume, totalCount, balance }) => ({
      date,
      totalVolume,
      totalCount,
      balance,
    })),
    monthly: complete.map(
      ({ month, volume, count, totalVolume, totalCount }) => ({
        month,
        volume,
        count,
        totalVolume,
        totalCount,
      })
    ),
    categories: { volume: withActivity('volume'), count: withActivity('count') },
    headline: {
      balance: last.balance,
      cumulativeVolume: sum('totalVolume'),
      cumulativeCount: sum('totalCount'),
      daysLive: Math.round((Date.parse(last.date) - Date.parse(first.date)) / DAY) + 1,
    },
  }
}

// The ledger balance is what members are owed; the onchain one is the eUSD in UGLYCASH's wallets.
export const withOnchainHeld = (
  metrics: UglycashMetrics,
  onchain: OnchainSeries
): UglycashMetrics => {
  const byDate = new Map(onchain.points.map((p) => [p.date, p.balance]))
  let held = onchain.points[0]?.balance ?? 0
  const daily = metrics.daily.map((point) => {
    held = byDate.get(point.date) ?? held
    return { ...point, balance: held }
  })
  return {
    ...metrics,
    daily,
    headline: {
      ...metrics.headline,
      balance: onchain.points.at(-1)?.balance ?? held,
    },
  }
}

const getJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`UGLYCASH metrics ${url}: ${res.status}`)
  return res.json()
}

export const useUglycashMetrics = () =>
  useQuery({
    queryKey: ['uglycash-metrics'],
    queryFn: async () => {
      const [daily, monthly, onchain] = await Promise.all([
        getJson<ApiSeries<{ date: string }>>(`${UGLYCASH_METRICS_API}/daily`),
        getJson<ApiSeries<{ month: string }>>(`${UGLYCASH_METRICS_API}/monthly`),
        getJson<OnchainSeries>(UGLYCASH_ONCHAIN_API),
      ])
      return withOnchainHeld(toUglycashMetrics(daily, monthly), onchain)
    },
    staleTime: 60 * 60 * 1000,
  })
