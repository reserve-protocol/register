import { ExposureGroup, ExposureToken } from '@/state/dtf/atoms'
import { formatMarketCap } from '@/utils'

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

// Market caps are keyed by token address for exchange tokens and by coingecko
// id for native groups; groups without a coingecko id fall back to their first
// token's address.
export const getExposureMarketCap = (
  row: ExposureRow,
  marketCaps: Record<string, number> | undefined
): string | undefined => {
  if (row.kind === 'token') {
    const cap = marketCaps?.[row.token.address.toLowerCase()]
    return cap ? formatMarketCap(cap) : undefined
  }

  const { native, tokens } = row.group

  if (native?.coingeckoId) {
    const cap = marketCaps?.[native.coingeckoId]
    return cap ? formatMarketCap(cap) : undefined
  }

  const fallbackKey = tokens[0]?.address.toLowerCase()
  const cap = fallbackKey ? marketCaps?.[fallbackKey] : undefined
  return cap ? formatMarketCap(cap) : undefined
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
