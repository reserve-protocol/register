import snapshot from './discover-snapshot.json'

export interface DiscoverRow {
  address: string
  name: string
  symbol: string
  chainId: number
  status: string
  price: number | null
  marketCap: number | null
  change: number | null
  brand: { icon?: string; tags: string[] }
  basket: { address: string; symbol: string; weight?: string }[]
  series: { timestamp: number; value: number }[]
}

export type DiscoverState =
  | 'default'
  | 'loading'
  | 'missing'
  | 'long'
  | 'inactive'
  | 'short-basket'
export const DISCOVER: DiscoverRow[] = snapshot.rows

export function previewDiscover(state: DiscoverState): DiscoverRow[] {
  if (state === 'inactive') return DISCOVER
  const active = DISCOVER.filter((row) => row.status === 'active')
  if (state === 'short-basket')
    return active.map((row) => ({
      ...row,
      basket: row.basket
        .slice(0, 1)
        .map((token) => ({ ...token, weight: '100' })),
    }))
  if (state === 'missing')
    return active.map((row, index) =>
      index < 2
        ? {
            ...row,
            price: index === 0 ? 0 : null,
            marketCap: index === 0 ? 0 : null,
            change: index === 0 ? 0 : null,
            series:
              index === 0
                ? [
                    { timestamp: 1, value: 1 },
                    { timestamp: 2, value: 1 },
                  ]
                : [],
            basket: index === 1 ? [] : row.basket,
          }
        : index === 2
          ? {
              ...row,
              basket: row.basket.slice(0, 2).map((asset, index) => ({
                ...asset,
                weight: index === 0 ? undefined : '0',
              })),
            }
          : row
    )
  if (state === 'long')
    return active.map((row, index) =>
      index === 0
        ? {
            ...row,
            name: `${row.name} — long-name fixture`,
            brand: {
              ...row.brand,
              tags: [...row.brand.tags, 'Infrastructure', 'Tokenized assets'],
            },
          }
        : row
    )
  return active
}

export const finiteValue = (value: number | null) =>
  value !== null && Number.isFinite(value) ? value : null

export function validTrend(series: DiscoverRow['series']) {
  return (
    series.length > 1 &&
    series.every(
      (point, index) =>
        Number.isFinite(point.value) &&
        Number.isFinite(point.timestamp) &&
        (index === 0 || point.timestamp > series[index - 1].timestamp)
    )
  )
}

export function trendDomain([low, high]: [number, number]): [number, number] {
  const padding =
    low === high ? Math.max(Math.abs(low) * 0.01, 0.01) : (high - low) * 0.08
  return [low - padding, high + padding]
}
