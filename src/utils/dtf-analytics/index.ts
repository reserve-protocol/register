import { Address } from 'viem'
import {
  DTFInput,
  DTFMonthlyMetrics,
  ProgressCallback,
  ExportProgress,
  PriceMap,
} from './types'
import {
  fetchDailySnapshots,
  fetchDTFMetadata,
  fetchTokensLockedHistory,
} from './fetch-daily-snapshots'
import {
  fetchDTFPriceHistory,
  fetchRSRPriceHistory,
  fetchTokenPriceHistory,
  timestampToDateKey,
} from './fetch-price-history'
import { aggregateDailyToMonthly, getTimeRange } from './calculate-metrics'
import { generateCSV, downloadCSV, generateFilename } from './generate-csv'

// RSR addresses across chains - all are fungible and should use the same price
const RSR_ADDRESSES: Record<string, boolean> = {
  '0x320623b8e4ff03373931769a31fc52a4e78b5d70': true, // Mainnet
  '0xab36452dbac151be02b16ca17d8919826072f64a': true, // Base
  '0xe0e2c47b29b9b203b1b5f8e7d1e2e9a0dcc7cb6e': true, // BSC
}

/**
 * Check if an address is RSR on any chain
 */
function isRSRToken(address: string): boolean {
  return RSR_ADDRESSES[address.toLowerCase()] === true
}

/**
 * Processes a single DTF and returns its monthly metrics
 */
async function processSingleDTF(
  dtf: DTFInput,
  onProgress?: (message: string) => void
): Promise<DTFMonthlyMetrics[]> {
  const { address, chainId } = dtf

  onProgress?.(`Fetching daily snapshots...`)

  // 1. Fetch daily snapshots
  const dailySnapshots = await fetchDailySnapshots(address as Address, chainId)

  if (dailySnapshots.length === 0) {
    onProgress?.(`No daily snapshots found`)
    return []
  }

  onProgress?.(`Found ${dailySnapshots.length} daily snapshots`)

  // 2. Fetch DTF metadata (for fees and stToken info)
  const metadata = await fetchDTFMetadata(address as Address, chainId)

  // 3. Determine time range
  const { from, to } = getTimeRange(dailySnapshots, metadata?.timestamp)

  onProgress?.(`Fetching price history...`)

  // 4. Fetch price histories in parallel
  const [dtfPrices, rsrPrices] = await Promise.all([
    fetchDTFPriceHistory(address as Address, chainId, from, to),
    fetchRSRPriceHistory(chainId, from, to),
  ])

  // 5. Fetch vote lock token prices if applicable
  let voteLockPrices: PriceMap = {}
  if (metadata?.stToken?.underlying?.address) {
    const underlyingAddress = metadata.stToken.underlying.address

    // Check if underlying is RSR on any chain
    if (isRSRToken(underlyingAddress)) {
      // Use RSR prices (always fetched from mainnet for reliability)
      voteLockPrices = rsrPrices
    } else {
      // Fetch custom token prices
      voteLockPrices = await fetchTokenPriceHistory(
        underlyingAddress,
        chainId,
        from,
        to
      )
    }
  }

  // 6. Try to fetch historical tokens locked data from stToken daily snapshots
  let tokensLockedMap: PriceMap = {}
  if (metadata?.stToken?.id) {
    onProgress?.(`Fetching tokens locked history...`)
    tokensLockedMap = await fetchTokensLockedHistory(
      metadata.stToken.id,
      chainId,
      dailySnapshots
    )
  }

  onProgress?.(`Calculating monthly metrics...`)

  // 7. Aggregate daily data to monthly
  const monthlyMetrics = aggregateDailyToMonthly(
    dtf,
    dailySnapshots,
    dtfPrices,
    rsrPrices,
    voteLockPrices,
    metadata,
    tokensLockedMap
  )

  onProgress?.(`Generated ${monthlyMetrics.length} monthly records`)

  return monthlyMetrics
}

/**
 * Main export function - processes all DTFs and generates CSV
 */
export async function exportDTFAnalytics(
  dtfList: DTFInput[],
  onProgress?: ProgressCallback
): Promise<void> {
  console.log('[DTF Analytics] Starting export with', dtfList.length, 'DTFs')
  console.log(
    '[DTF Analytics] DTF list:',
    dtfList.map((d) => ({
      symbol: d.symbol,
      address: d.address,
      chain: d.chainId,
    }))
  )

  const allMetrics: DTFMonthlyMetrics[] = []
  const total = dtfList.length

  onProgress?.({
    current: 0,
    total,
    phase: 'fetching',
  })

  // Process each DTF sequentially to avoid rate limiting
  for (let i = 0; i < dtfList.length; i++) {
    const dtf = dtfList[i]

    onProgress?.({
      current: i,
      total,
      currentDtf: dtf.symbol,
      phase: 'fetching',
    })

    try {
      const metrics = await processSingleDTF(dtf, (msg) => {
        onProgress?.({
          current: i,
          total,
          currentDtf: `${dtf.symbol}: ${msg}`,
          phase: 'fetching',
        })
      })

      allMetrics.push(...metrics)
    } catch (error) {
      console.error(`Error processing DTF ${dtf.symbol}:`, error)
      // Continue with other DTFs
    }

    // Small delay between DTFs to avoid rate limiting
    if (i < dtfList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  onProgress?.({
    current: total,
    total,
    phase: 'generating',
  })

  console.log('[DTF Analytics] Total metrics collected:', allMetrics.length)

  // Sort all metrics by DTF symbol, then by monthKey
  allMetrics.sort((a, b) => {
    const symbolCompare = a.dtfSymbol.localeCompare(b.dtfSymbol)
    if (symbolCompare !== 0) return symbolCompare
    return a.monthKey.localeCompare(b.monthKey)
  })

  // Generate and download CSV
  const csvContent = generateCSV(allMetrics)
  const filename = generateFilename()

  console.log('[DTF Analytics] Generated CSV with', allMetrics.length, 'rows')
  console.log('[DTF Analytics] CSV preview (first 500 chars):', csvContent.substring(0, 500))

  downloadCSV(csvContent, filename)

  onProgress?.({
    current: total,
    total,
    phase: 'generating',
  })
}

// Re-export types for convenience
export type {
  DTFInput,
  DTFMonthlyMetrics,
  ProgressCallback,
  ExportProgress,
} from './types'
