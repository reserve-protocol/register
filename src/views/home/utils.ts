import { formatCurrency } from '@/utils'

const COMPACT = { notation: 'compact', compactDisplay: 'short' } as const

export const usd = (value: number) => `$${formatCurrency(value, 0)}`

export const usdCompact = (value: number, decimals = 1) =>
  `$${formatCurrency(value, decimals, COMPACT)}`

export const countCompact = (value: number, decimals = 1) =>
  formatCurrency(value, decimals, COMPACT)

const utcDate = (iso: string) => new Date(`${iso}T00:00:00Z`)

export const shortDate = (iso: string, locale: string) =>
  utcDate(iso).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const monthYear = (month: string, locale: string) =>
  utcDate(`${month}-01`).toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const monthName = (month: string, locale: string) =>
  utcDate(`${month}-01`).toLocaleDateString(locale, {
    month: 'long',
    timeZone: 'UTC',
  })
