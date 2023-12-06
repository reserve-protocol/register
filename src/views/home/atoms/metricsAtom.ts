import { atom } from 'jotai'
import { rpayOverviewAtom } from 'state/atoms'
import { supportedChainList } from 'utils/constants'

// TODO: Remove @deprecated
export interface ProtocolMetrics {
  totalRTokenMarketUsd: number
  tvl: number
  stakersRevenue: number
  holdersRevenue: number
  volume: number
  transactionCount: number
  dailyVolume: number
  dailyTransactionCount: number
}

export interface ProtocolMetricsOverview {
  [x: number]: ProtocolMetrics
}

export const protocolMetricsAtom = atom<ProtocolMetricsOverview | null>(null)

export const aggregatedProtocolMetricsAtom = atom((get) => {
  const protocolMetrics = get(protocolMetricsAtom)
  const rpay = get(rpayOverviewAtom)
  const aggregatedMetrics = {
    totalRTokenMarketUsd: 0,
    tvl: 0,
    stakersRevenue: 0,
    holdersRevenue: 0,
    volume: 0,
    transactionCount: 0,
    dailyVolume: 0,
    dailyTransactionCount: 0,
  }

  if (!protocolMetrics) {
    return aggregatedMetrics
  }

  // Aggregate all chain results
  for (const chain of supportedChainList) {
    aggregatedMetrics.totalRTokenMarketUsd +=
      protocolMetrics[chain].totalRTokenMarketUsd
    aggregatedMetrics.tvl += protocolMetrics[chain].tvl
    aggregatedMetrics.stakersRevenue += protocolMetrics[chain].stakersRevenue
    aggregatedMetrics.holdersRevenue += protocolMetrics[chain].holdersRevenue
    aggregatedMetrics.volume += protocolMetrics[chain].volume
    aggregatedMetrics.transactionCount +=
      protocolMetrics[chain].transactionCount
    aggregatedMetrics.dailyVolume += protocolMetrics[chain].dailyVolume
    aggregatedMetrics.dailyTransactionCount +=
      protocolMetrics[chain].dailyTransactionCount
  }

  // Aggregate rpay metrics
  aggregatedMetrics.volume += rpay.volume
  aggregatedMetrics.transactionCount += rpay.txCount
  aggregatedMetrics.dailyTransactionCount += rpay.dayTxCount
  aggregatedMetrics.dailyVolume += rpay.dayVolume

  return aggregatedMetrics
})
