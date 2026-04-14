import { formatEther } from 'viem'
import {
  TokenDailySnapshot,
  DTFMetadata,
  DTFMonthlyMetrics,
  PriceMap,
  DTFInput,
  InternalMintEvent,
  InternalBalanceSnapshot,
} from './types'
import {
  timestampToDateKey,
  timestampToMonthKey,
  getPriceForDate,
  getMonthEndPrice,
} from './fetch-price-history'

// Chain name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  56: 'BSC',
  42161: 'Arbitrum',
}

interface MonthlyAccumulator {
  // Summed values
  distributedRevenue: number
  distributedRevenueUsd: number
  governanceRevenue: number
  governanceRevenueUsd: number
  externalRevenue: number
  externalRevenueUsd: number
  protocolRevenue: number
  protocolRevenueUsd: number
  monthlyMinted: number
  monthlyMintedUsd: number
  tvlFeeRevenue: number
  tvlFeeRevenueUsd: number
  mintingFeeRevenue: number
  mintingFeeRevenueUsd: number
  estRsrBurnAmount: number

  // Internal wallet metrics
  internalMintingFeeRevenue: number
  internalMintingFeeRevenueUsd: number
  internalTvlFeeRevenue: number
  internalTvlFeeRevenueUsd: number
  internalBalanceSum: number
  internalBalanceUsdSum: number
  internalBalanceDays: number

  // Month-end values (from last day of month)
  totalSupply: number
  marketCapUsd: number
  holderCount: number
  tokensLocked: number
  tokensLockedUsd: number

  // For averaging
  priceSum: number
  priceCount: number

  // Track days for month-end
  lastTimestamp: number
  lastDtfPrice: number
  lastRsrPrice: number
  lastVoteLockPrice: number
}

/**
 * Parses BigInt string from subgraph to number (dividing by 1e18)
 */
function parseBigIntToNumber(value: string | undefined | null): number {
  if (!value || value === '0') return 0
  try {
    return +formatEther(BigInt(value))
  } catch {
    return 0
  }
}

/**
 * Creates an empty monthly accumulator
 */
function createEmptyAccumulator(): MonthlyAccumulator {
  return {
    distributedRevenue: 0,
    distributedRevenueUsd: 0,
    governanceRevenue: 0,
    governanceRevenueUsd: 0,
    externalRevenue: 0,
    externalRevenueUsd: 0,
    protocolRevenue: 0,
    protocolRevenueUsd: 0,
    monthlyMinted: 0,
    monthlyMintedUsd: 0,
    tvlFeeRevenue: 0,
    tvlFeeRevenueUsd: 0,
    mintingFeeRevenue: 0,
    mintingFeeRevenueUsd: 0,
    estRsrBurnAmount: 0,
    internalMintingFeeRevenue: 0,
    internalMintingFeeRevenueUsd: 0,
    internalTvlFeeRevenue: 0,
    internalTvlFeeRevenueUsd: 0,
    internalBalanceSum: 0,
    internalBalanceUsdSum: 0,
    internalBalanceDays: 0,
    totalSupply: 0,
    marketCapUsd: 0,
    holderCount: 0,
    tokensLocked: 0,
    tokensLockedUsd: 0,
    priceSum: 0,
    priceCount: 0,
    lastTimestamp: 0,
    lastDtfPrice: 0,
    lastRsrPrice: 0,
    lastVoteLockPrice: 0,
  }
}

/**
 * Builds a dateKey -> total mint amount map from internal mint events
 */
export function buildInternalMintsMap(
  mints: InternalMintEvent[]
): PriceMap {
  const map: PriceMap = {}
  for (const mint of mints) {
    const dateKey = timestampToDateKey(mint.timestamp)
    const amount = parseBigIntToNumber(mint.amount)
    map[dateKey] = (map[dateKey] || 0) + amount
  }
  return map
}

/**
 * Builds a dateKey -> total internal balance map from balance snapshots.
 * Carries forward last known balance per account for days without snapshots.
 */
export function buildInternalBalanceMap(
  snapshots: InternalBalanceSnapshot[]
): PriceMap {
  if (snapshots.length === 0) return {}

  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)
  const accountBalances: Record<string, number> = {}
  const dailyTotals: PriceMap = {}

  for (const snapshot of sorted) {
    const dateKey = timestampToDateKey(snapshot.timestamp)
    accountBalances[snapshot.account] = parseBigIntToNumber(snapshot.amount)

    let total = 0
    for (const balance of Object.values(accountBalances)) {
      total += balance
    }
    dailyTotals[dateKey] = total
  }

  return dailyTotals
}

/**
 * Aggregates daily snapshots into monthly metrics
 */
export function aggregateDailyToMonthly(
  dtfInput: DTFInput,
  dailySnapshots: TokenDailySnapshot[],
  dtfPrices: PriceMap,
  rsrPrices: PriceMap,
  voteLockPrices: PriceMap,
  metadata: DTFMetadata | null,
  tokensLockedMap: PriceMap, // Map of dateKey -> tokens locked amount
  internalMintsMap: PriceMap = {},
  internalBalanceMap: PriceMap = {}
): DTFMonthlyMetrics[] {
  if (dailySnapshots.length === 0) {
    return []
  }

  // Parse fee rates from metadata
  const mintingFee = metadata ? parseBigIntToNumber(metadata.mintingFee) : 0
  const annualizedTvlFee = metadata
    ? parseBigIntToNumber(metadata.annualizedTvlFee)
    : 0

  // Group snapshots by month
  const monthlyData: Map<string, MonthlyAccumulator> = new Map()

  // Track last known internal balance for carry-forward
  let lastInternalBalance = 0

  for (const snapshot of dailySnapshots) {
    const monthKey = timestampToMonthKey(snapshot.timestamp)
    const dateKey = timestampToDateKey(snapshot.timestamp)

    // Get or create accumulator for this month
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, createEmptyAccumulator())
    }
    const acc = monthlyData.get(monthKey)!

    // Get daily prices
    const dtfPrice = getPriceForDate(dtfPrices, dateKey) || 0
    const rsrPrice = getPriceForDate(rsrPrices, dateKey) || 0
    const voteLockPrice = getPriceForDate(voteLockPrices, dateKey) || 0

    // Parse daily values
    const dailyRevenue = parseBigIntToNumber(snapshot.dailyRevenue)
    const dailyProtocolRevenue = parseBigIntToNumber(
      snapshot.dailyProtocolRevenue
    )
    const dailyGovernanceRevenue = parseBigIntToNumber(
      snapshot.dailyGovernanceRevenue
    )
    const dailyExternalRevenue = parseBigIntToNumber(
      snapshot.dailyExternalRevenue
    )
    const dailyMintAmount = parseBigIntToNumber(snapshot.dailyMintAmount)
    const dailyTotalSupply = parseBigIntToNumber(snapshot.dailyTotalSupply)

    // Calculate derived fee revenues
    // TVL fee revenue = totalSupply * annualizedTvlFee / 365
    const dailyTvlFeeRevenue = dailyTotalSupply * (annualizedTvlFee / 365)
    // Minting fee revenue = mintAmount * mintingFee
    const dailyMintingFeeRevenue = dailyMintAmount * mintingFee

    // Accumulate summed values
    acc.distributedRevenue += dailyRevenue
    acc.distributedRevenueUsd += dailyRevenue * dtfPrice
    acc.governanceRevenue += dailyGovernanceRevenue
    acc.governanceRevenueUsd += dailyGovernanceRevenue * dtfPrice
    acc.externalRevenue += dailyExternalRevenue
    acc.externalRevenueUsd += dailyExternalRevenue * dtfPrice
    acc.protocolRevenue += dailyProtocolRevenue
    acc.protocolRevenueUsd += dailyProtocolRevenue * dtfPrice
    acc.monthlyMinted += dailyMintAmount
    acc.monthlyMintedUsd += dailyMintAmount * dtfPrice
    acc.tvlFeeRevenue += dailyTvlFeeRevenue
    acc.tvlFeeRevenueUsd += dailyTvlFeeRevenue * dtfPrice
    acc.mintingFeeRevenue += dailyMintingFeeRevenue
    acc.mintingFeeRevenueUsd += dailyMintingFeeRevenue * dtfPrice

    // Estimate RSR burn amount (protocol revenue / RSR price)
    if (rsrPrice > 0) {
      acc.estRsrBurnAmount += (dailyProtocolRevenue * dtfPrice) / rsrPrice
    }

    // Internal wallet metrics
    const internalMintAmount = internalMintsMap[dateKey] || 0
    const dailyInternalMintingFeeRevenue = internalMintAmount * mintingFee
    acc.internalMintingFeeRevenue += dailyInternalMintingFeeRevenue
    acc.internalMintingFeeRevenueUsd += dailyInternalMintingFeeRevenue * dtfPrice

    if (internalBalanceMap[dateKey] !== undefined) {
      lastInternalBalance = internalBalanceMap[dateKey]
    }
    const dailyInternalTvlFeeRevenue =
      lastInternalBalance * (annualizedTvlFee / 365)
    acc.internalTvlFeeRevenue += dailyInternalTvlFeeRevenue
    acc.internalTvlFeeRevenueUsd += dailyInternalTvlFeeRevenue * dtfPrice
    acc.internalBalanceSum += lastInternalBalance
    acc.internalBalanceUsdSum += lastInternalBalance * dtfPrice
    acc.internalBalanceDays += 1

    // Track price for averaging
    if (dtfPrice > 0) {
      acc.priceSum += dtfPrice
      acc.priceCount += 1
    }

    // Update month-end values (keep the latest)
    if (snapshot.timestamp >= acc.lastTimestamp) {
      acc.lastTimestamp = snapshot.timestamp
      acc.totalSupply = dailyTotalSupply
      acc.marketCapUsd = dailyTotalSupply * dtfPrice
      acc.holderCount = snapshot.currentHolderCount
      acc.lastDtfPrice = dtfPrice
      acc.lastRsrPrice = rsrPrice
      acc.lastVoteLockPrice = voteLockPrice

      // Get tokens locked for this date (underlying tokens like RSR locked in governance)
      // tokensLocked is in underlying tokens, so USD value uses voteLockPrice
      const tokensLocked = tokensLockedMap[dateKey] || 0
      acc.tokensLocked = tokensLocked
      acc.tokensLockedUsd = tokensLocked * voteLockPrice
    }
  }

  // Convert accumulators to DTFMonthlyMetrics
  const results: DTFMonthlyMetrics[] = []

  for (const [monthKey, acc] of monthlyData.entries()) {
    const [yearStr, monthStr] = monthKey.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    const avgPrice =
      acc.priceCount > 0 ? acc.priceSum / acc.priceCount : acc.lastDtfPrice

    results.push({
      dtfAddress: dtfInput.address,
      dtfSymbol: dtfInput.symbol,
      dtfName: dtfInput.name,
      chainId: dtfInput.chainId,
      chainName: CHAIN_NAMES[dtfInput.chainId] || `Chain ${dtfInput.chainId}`,
      month,
      year,
      monthKey,

      totalSupply: acc.totalSupply,
      marketCapUsd: acc.marketCapUsd,
      tokensLocked: acc.tokensLocked,
      tokensLockedUsd: acc.tokensLockedUsd,
      cumulativeTokensLocked: 0, // Will be calculated after sorting
      cumulativeTokensLockedUsd: 0,
      tvlUsd: acc.marketCapUsd + acc.tokensLockedUsd,

      totalRevenue: acc.tvlFeeRevenue + acc.mintingFeeRevenue,
      totalRevenueUsd: acc.tvlFeeRevenueUsd + acc.mintingFeeRevenueUsd,
      tvlFeeRevenue: acc.tvlFeeRevenue,
      tvlFeeRevenueUsd: acc.tvlFeeRevenueUsd,
      mintingFeeRevenue: acc.mintingFeeRevenue,
      mintingFeeRevenueUsd: acc.mintingFeeRevenueUsd,
      distributedRevenue: acc.distributedRevenue,
      distributedRevenueUsd: acc.distributedRevenueUsd,

      monthlyMinted: acc.monthlyMinted,
      monthlyMintedUsd: acc.monthlyMintedUsd,

      governanceRevenue: acc.governanceRevenue,
      governanceRevenueUsd: acc.governanceRevenueUsd,
      externalRevenue: acc.externalRevenue,
      externalRevenueUsd: acc.externalRevenueUsd,
      protocolRevenue: acc.protocolRevenue,
      protocolRevenueUsd: acc.protocolRevenueUsd,
      estRsrBurnAmount: acc.estRsrBurnAmount,

      internalTvl:
        acc.internalBalanceDays > 0
          ? acc.internalBalanceSum / acc.internalBalanceDays
          : 0,
      internalTvlUsd:
        acc.internalBalanceDays > 0
          ? acc.internalBalanceUsdSum / acc.internalBalanceDays
          : 0,
      internalMintingFeeRevenue: acc.internalMintingFeeRevenue,
      internalMintingFeeRevenueUsd: acc.internalMintingFeeRevenueUsd,
      internalTvlFeeRevenue: acc.internalTvlFeeRevenue,
      internalTvlFeeRevenueUsd: acc.internalTvlFeeRevenueUsd,
      internalRevenue:
        acc.internalMintingFeeRevenue + acc.internalTvlFeeRevenue,
      internalRevenueUsd:
        acc.internalMintingFeeRevenueUsd + acc.internalTvlFeeRevenueUsd,

      holderCount: acc.holderCount,

      dtfPrice: acc.lastDtfPrice || avgPrice,
      rsrPrice: acc.lastRsrPrice,
      voteLockPrice: acc.lastVoteLockPrice,

      // Cumulative values will be calculated after sorting
      cumulativeRevenue: 0,
      cumulativeRevenueUsd: 0,
      cumulativeMinted: 0,
      cumulativeMintedUsd: 0,
      cumulativeGovernanceRevenue: 0,
      cumulativeGovernanceRevenueUsd: 0,
      cumulativeExternalRevenue: 0,
      cumulativeExternalRevenueUsd: 0,
      cumulativeProtocolRevenue: 0,
      cumulativeProtocolRevenueUsd: 0,
      cumulativeDistributedRevenue: 0,
      cumulativeDistributedRevenueUsd: 0,
      cumulativeEstRsrBurnAmount: 0,
      cumulativeInternalRevenue: 0,
      cumulativeInternalRevenueUsd: 0,
      cumulativeInternalMintingFeeRevenue: 0,
      cumulativeInternalMintingFeeRevenueUsd: 0,
      cumulativeInternalTvlFeeRevenue: 0,
      cumulativeInternalTvlFeeRevenueUsd: 0,
    })
  }

  // Sort by monthKey to ensure chronological order
  results.sort((a, b) => a.monthKey.localeCompare(b.monthKey))

  // Calculate cumulative values (running totals)
  let cumTokensLocked = 0
  let cumTokensLockedUsd = 0
  let cumRevenue = 0
  let cumRevenueUsd = 0
  let cumMinted = 0
  let cumMintedUsd = 0
  let cumGovRevenue = 0
  let cumGovRevenueUsd = 0
  let cumExtRevenue = 0
  let cumExtRevenueUsd = 0
  let cumProtocolRevenue = 0
  let cumProtocolRevenueUsd = 0
  let cumDistributedRevenue = 0
  let cumDistributedRevenueUsd = 0
  let cumEstRsrBurn = 0
  let cumInternalRevenue = 0
  let cumInternalRevenueUsd = 0
  let cumInternalMintingFeeRevenue = 0
  let cumInternalMintingFeeRevenueUsd = 0
  let cumInternalTvlFeeRevenue = 0
  let cumInternalTvlFeeRevenueUsd = 0

  for (const metric of results) {
    cumTokensLocked += metric.tokensLocked
    cumTokensLockedUsd += metric.tokensLockedUsd
    cumRevenue += metric.totalRevenue
    cumRevenueUsd += metric.totalRevenueUsd
    cumMinted += metric.monthlyMinted
    cumMintedUsd += metric.monthlyMintedUsd
    cumGovRevenue += metric.governanceRevenue
    cumGovRevenueUsd += metric.governanceRevenueUsd
    cumExtRevenue += metric.externalRevenue
    cumExtRevenueUsd += metric.externalRevenueUsd
    cumProtocolRevenue += metric.protocolRevenue
    cumProtocolRevenueUsd += metric.protocolRevenueUsd
    cumDistributedRevenue += metric.distributedRevenue
    cumDistributedRevenueUsd += metric.distributedRevenueUsd
    cumEstRsrBurn += metric.estRsrBurnAmount

    metric.cumulativeTokensLocked = cumTokensLocked
    metric.cumulativeTokensLockedUsd = cumTokensLockedUsd
    metric.cumulativeRevenue = cumRevenue
    metric.cumulativeRevenueUsd = cumRevenueUsd
    metric.cumulativeMinted = cumMinted
    metric.cumulativeMintedUsd = cumMintedUsd
    metric.cumulativeGovernanceRevenue = cumGovRevenue
    metric.cumulativeGovernanceRevenueUsd = cumGovRevenueUsd
    metric.cumulativeExternalRevenue = cumExtRevenue
    metric.cumulativeExternalRevenueUsd = cumExtRevenueUsd
    metric.cumulativeProtocolRevenue = cumProtocolRevenue
    metric.cumulativeProtocolRevenueUsd = cumProtocolRevenueUsd
    metric.cumulativeDistributedRevenue = cumDistributedRevenue
    metric.cumulativeDistributedRevenueUsd = cumDistributedRevenueUsd
    metric.cumulativeEstRsrBurnAmount = cumEstRsrBurn

    cumInternalRevenue += metric.internalRevenue
    cumInternalRevenueUsd += metric.internalRevenueUsd
    cumInternalMintingFeeRevenue += metric.internalMintingFeeRevenue
    cumInternalMintingFeeRevenueUsd += metric.internalMintingFeeRevenueUsd
    cumInternalTvlFeeRevenue += metric.internalTvlFeeRevenue
    cumInternalTvlFeeRevenueUsd += metric.internalTvlFeeRevenueUsd
    metric.cumulativeInternalRevenue = cumInternalRevenue
    metric.cumulativeInternalRevenueUsd = cumInternalRevenueUsd
    metric.cumulativeInternalMintingFeeRevenue = cumInternalMintingFeeRevenue
    metric.cumulativeInternalMintingFeeRevenueUsd = cumInternalMintingFeeRevenueUsd
    metric.cumulativeInternalTvlFeeRevenue = cumInternalTvlFeeRevenue
    metric.cumulativeInternalTvlFeeRevenueUsd = cumInternalTvlFeeRevenueUsd
  }

  return results
}

/**
 * Gets the time range needed for fetching data
 * Returns { from, to } timestamps in seconds
 */
export function getTimeRange(
  dailySnapshots: TokenDailySnapshot[],
  deploymentTimestamp?: number | null
): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000)

  if (dailySnapshots.length === 0) {
    // If no snapshots, use deployment timestamp or default to 1 year ago
    const defaultFrom = deploymentTimestamp || now - 365 * 24 * 60 * 60
    return { from: defaultFrom, to: now }
  }

  // Use earliest snapshot timestamp as from
  const timestamps = dailySnapshots.map((s) => s.timestamp)
  const from = Math.min(...timestamps)

  return { from, to: now }
}
