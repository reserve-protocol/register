import { ExposureGroup, ExposureToken } from '@/state/dtf/atoms'

export const EXCHANGE_LABELS: Record<string, string> = {
  nasdaq: 'NASDAQ',
  nyse: 'NYSE',
}

// Ondo tokenized stocks always carry an "on" suffix (e.g. MRVLon)
export const formatExchangeSymbol = (symbol: string, exchange: string) =>
  `${exchange}: $${symbol.replace(/on$/, '')}`

export type ExposureRow =
  | {
      kind: 'group'
      key: string
      group: ExposureGroup
      weight: number
      change: number | null | undefined
    }
  | {
      kind: 'token'
      key: string
      group: ExposureGroup
      token: ExposureToken
      exchange: string
      weight: number
      change: number | null | undefined
    }

// Exchange groups (nasdaq/nyse) bundle every stock under one ExposureGroup, so
// flatten them into per-token rows. That way the table sorts/slices/counts the
// same units it renders, and individual stocks interleave by their own weight.
export const buildExposureRows = (
  groups: [string, ExposureGroup][]
): ExposureRow[] =>
  groups.flatMap<ExposureRow>(([key, group]) => {
    const exchange = EXCHANGE_LABELS[group.native?.caip2 ?? '']

    if (exchange) {
      return group.tokens.map((token) => ({
        kind: 'token' as const,
        key: token.address,
        group,
        token,
        exchange,
        weight: token.weight,
        change: token.change ?? group.change ?? null,
      }))
    }

    return [
      {
        kind: 'group' as const,
        key,
        group,
        weight: group.totalWeight,
        change: group.change ?? null,
      },
    ]
  })
