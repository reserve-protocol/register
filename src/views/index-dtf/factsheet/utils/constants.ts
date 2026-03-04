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
export const currentHour = Math.floor(now / 3_600) * 3_600

export const getRangeParams = (range: string, minFrom: number = 0) => {
  const intervals = {
    '24h': {
      from: currentHour - TIME_PERIODS.DAY,
      to: currentHour,
      interval: '1h' as const,
    },
    '7d': {
      from: currentHour - TIME_PERIODS.WEEK,
      to: currentHour,
      interval: '1h' as const,
    },
    '1m': {
      from: currentHour - TIME_PERIODS.MONTH,
      to: currentHour,
      interval: '1d' as const,
    },
    '3m': {
      from: currentHour - TIME_PERIODS.THREE_MONTHS,
      to: currentHour,
      interval: '1d' as const,
    },
    '1y': {
      from: currentHour - TIME_PERIODS.YEAR,
      to: currentHour,
      interval: '1d' as const,
    },
    all: { from: minFrom, to: currentHour, interval: '1d' as const },
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
