export const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

export const TIME_PERIODS = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  THREE_MONTHS: 7776000,
  SIX_MONTHS: 15552000,
  YEAR: 31536000,
} as const

const now = Math.floor(Date.now() / 1000)

export const getRangeParams = (range: string) => {
  const intervals = {
    '24h': { from: now - TIME_PERIODS.DAY, to: now, interval: '1h' as const },
    '7d': { from: now - TIME_PERIODS.WEEK, to: now, interval: '1h' as const },
    '1m': { from: now - TIME_PERIODS.MONTH, to: now, interval: '1d' as const },
    '3m': {
      from: now - TIME_PERIODS.THREE_MONTHS,
      to: now,
      interval: '1d' as const,
    },
    '1y': { from: now - TIME_PERIODS.YEAR, to: now, interval: '1d' as const },
    all: { from: 0, to: now, interval: '1d' as const },
  }
  return intervals[range as keyof typeof intervals] || intervals['7d']
}

export const MONTH_NAMES = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const
