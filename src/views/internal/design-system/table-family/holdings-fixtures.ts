import type { NativeToken, Bridge } from '@/types/token-mappings'
import snapshot from './holdings-snapshot.json'

export type HoldingsTab = 'exposure' | 'collateral'
export type HoldingsState =
  | 'default'
  | 'loading'
  | 'performance-loading'
  | 'missing'
  | 'new'
  | 'long'
  | 'empty'
export interface Holding {
  name: string
  native: NativeToken
  address: string
  symbol: string
  weight: number
  change: number | null
  marketCap: number | null
  exposureCap: number | null
  bridgeId: string | null
  sources?: number
  newlyAdded?: boolean
}

export const HOLDINGS = {
  cmc20: snapshot.cmc20,
  photon: snapshot.photon,
} satisfies Record<string, Holding[]>
export const BRIDGES: Record<string, Bridge> = snapshot.bridges
export const holdingsSortOptions = [
  ['weight', 'Weight'],
  ['change', 'Price Change (7d)'],
] as const

export function previewHoldings(
  rows: Holding[],
  state: HoldingsState
): Holding[] {
  if (state === 'empty') return []
  const longNameExamples =
    state === 'long'
      ? HOLDINGS.photon.filter(
          (example) =>
            example.symbol === 'AAOIon' &&
            !rows.some((row) => row.address === example.address)
        )
      : []
  return [...rows, ...longNameExamples].map((row, index) => ({
    ...row,
    ...(state === 'missing' && index < 2
      ? {
          change: index === 0 ? 0 : null,
          marketCap: index === 0 ? 0 : null,
          exposureCap: index === 0 ? 0 : null,
        }
      : {}),
    ...(state === 'new' && index === 0 ? { newlyAdded: true } : {}),
    ...(state === 'long' && index === 0
      ? {
          name: 'A held token with an unusually long name that needs to wrap',
          native: {
            ...row.native,
            name: 'An underlying asset with an unusually long display name',
          },
          sources: 2,
        }
      : {}),
  }))
}
