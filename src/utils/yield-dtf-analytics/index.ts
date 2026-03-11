import { Address } from 'viem'
import {
  YieldDTFInput,
  YieldDTFMonthlyMetrics,
  ProgressCallback,
} from './types'
import {
  fetchTokenDailySnapshots,
  fetchRTokenDailySnapshots,
} from './fetch-daily-snapshots'
import { calculateMetrics } from './calculate-metrics'
import { generateCSV, downloadCSV, generateFilename } from './generate-csv'

async function processSingleYieldDTF(
  dtf: YieldDTFInput
): Promise<YieldDTFMonthlyMetrics[]> {
  const [tokenSnapshots, rTokenSnapshots] = await Promise.all([
    fetchTokenDailySnapshots(dtf.address, dtf.chainId),
    fetchRTokenDailySnapshots(dtf.address, dtf.chainId),
  ])

  if (tokenSnapshots.length === 0) return []

  return calculateMetrics(dtf, tokenSnapshots, rTokenSnapshots)
}

export async function exportYieldDTFAnalytics(
  dtfList: YieldDTFInput[],
  onProgress?: ProgressCallback
): Promise<void> {
  const allMetrics: YieldDTFMonthlyMetrics[] = []
  const total = dtfList.length

  onProgress?.({ current: 0, total, phase: 'fetching' })

  for (let i = 0; i < dtfList.length; i++) {
    const dtf = dtfList[i]

    onProgress?.({
      current: i,
      total,
      currentDtf: dtf.symbol,
      phase: 'fetching',
    })

    try {
      const metrics = await processSingleYieldDTF(dtf)
      allMetrics.push(...metrics)
    } catch (error) {
      console.error(`Error processing Yield DTF ${dtf.symbol}:`, error)
    }

    if (i < dtfList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  onProgress?.({ current: total, total, phase: 'generating' })

  allMetrics.sort((a, b) => {
    const symbolCompare = a.symbol.localeCompare(b.symbol)
    if (symbolCompare !== 0) return symbolCompare
    return a.monthKey.localeCompare(b.monthKey)
  })

  const csvContent = generateCSV(allMetrics)
  const filename = generateFilename()
  downloadCSV(csvContent, filename)
}

export type { YieldDTFInput, YieldDTFMonthlyMetrics, ProgressCallback } from './types'
export type { ExportProgress } from './types'
