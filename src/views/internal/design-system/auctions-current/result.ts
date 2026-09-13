import type { HistoricalRebalance } from '../auctions-browse/history-model'
import type { SourceRecord, DataState } from './fixtures'
import type { WorkspaceState } from './model'
import { usdFromCents } from './weights-model'

export function resultRow(
  record: SourceRecord,
  state: WorkspaceState,
  data: DataState
): HistoricalRebalance {
  const known = data === 'ready'
  return {
    identity: record.identity,
    chainId: record.chainId,
    status: state.progress === 100 ? 'Completed' : 'Expired',
    accuracy: known ? `${state.progress}%` : null,
    priceImpact: {
      value: known ? (state.traded ? '−0.3%' : '0%') : null,
      tone: state.traded ? 'negative' : undefined,
    },
    priceImpactUsd: known
      ? state.traded
        ? `−${usdFromCents((state.traded * 3n + 500n) / 1000n)}`
        : '$0'
      : null,
    navChange: {
      value: known ? (state.traded ? '−0.18%' : '0%') : null,
      tone: state.traded ? 'negative' : undefined,
    },
    auctions: known ? state.runs : null,
    traded: known ? (state.traded ? usdFromCents(state.traded) : '$0') : null,
    metricsLoading: data === 'pending',
  }
}
