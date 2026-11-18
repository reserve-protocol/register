export const PERIODS = ['1w', '1m', '3m', '1y', 'all'] as const

export type Period = (typeof PERIODS)[number]

export const DEFAULT_PERIOD: Period = '1m'

const DAY = 24 * 60 * 60

const PERIOD_SECONDS: Record<Exclude<Period, 'all'>, number> = {
  '1w': 7 * DAY,
  '1m': 30 * DAY,
  '3m': 90 * DAY,
  '1y': 365 * DAY,
}

export const parsePeriod = (value: string | null): Period =>
  PERIODS.includes(value as Period) ? (value as Period) : DEFAULT_PERIOD

export const isWithinPeriod = (
  creationTime: number,
  period: Period,
  now: number
) => period === 'all' || creationTime >= now - PERIOD_SECONDS[period]
