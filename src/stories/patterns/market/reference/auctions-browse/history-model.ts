import {
  ILLUSTRATIVE_METRICS,
  REBALANCE_IDENTITIES,
  type RebalanceIdentity,
} from './fixtures'
import { priceImpactDisplay } from './model'

export const HISTORY_STATES = {
  default: 'Default',
  expired: 'Expired',
  pressure: 'Long content',
  'metrics-loading': 'Metrics loading',
  unavailable: 'Unavailable',
  zero: 'Zero',
  loading: 'Loading',
  empty: 'Empty',
} as const

export type HistoryState = keyof typeof HISTORY_STATES
export interface HistoricalRebalance {
  identity: RebalanceIdentity
  chainId?: number
  status: 'Completed' | 'Expired'
  accuracy: string | null
  priceImpact: ReturnType<typeof priceImpactDisplay>
  priceImpactUsd: string | null
  navChange: ReturnType<typeof priceImpactDisplay>
  auctions: number | null
  traded: string | null
  metricsLoading: boolean
}

const ILLUSTRATIVE_HISTORY_DETAILS = [
  {
    priceImpactUsd: '$1,272',
    navChange: { value: '−0.18%', tone: 'negative' },
  },
  { priceImpactUsd: '$14', navChange: { value: '+0.04%', tone: 'positive' } },
  { priceImpactUsd: '$0', navChange: { value: '0%' } },
] as const

export function historicalRebalances(
  state: HistoryState
): HistoricalRebalance[] {
  if (state === 'empty') return []
  return REBALANCE_IDENTITIES.slice(1).map((identity, index) => {
    const expired =
      state === 'zero' ||
      ((state === 'expired' || state === 'pressure') && index === 2)
    const unavailable =
      state === 'unavailable' || (state === 'pressure' && index === 2)
    const metrics = ILLUSTRATIVE_METRICS[index]
    const details = ILLUSTRATIVE_HISTORY_DETAILS[index]
    return {
      identity,
      status: expired ? 'Expired' : 'Completed',
      accuracy: unavailable || expired ? null : `${metrics.accuracy}%`,
      priceImpact: priceImpactDisplay(
        unavailable ? null : expired ? 0 : metrics.priceImpact
      ),
      priceImpactUsd: unavailable
        ? null
        : expired
          ? '$0'
          : details.priceImpactUsd,
      navChange: unavailable
        ? { value: null }
        : expired
          ? { value: '0%' }
          : details.navChange,
      auctions: unavailable ? null : expired ? 0 : metrics.auctions,
      traded: unavailable ? null : expired ? '$0' : metrics.traded,
      metricsLoading: state === 'metrics-loading',
    }
  })
}
