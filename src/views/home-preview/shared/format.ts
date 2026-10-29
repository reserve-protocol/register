import { formatCurrency } from '@/utils'

export const usd = (v: number) => `$${formatCurrency(v, 0)}`

export const usdCompact = (v: number, decimals = 1) =>
  `$${formatCurrency(v, decimals, { notation: 'compact', compactDisplay: 'short' })}`

export const countCompact = (v: number, decimals = 1) =>
  formatCurrency(v, decimals, { notation: 'compact', compactDisplay: 'short' })

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
