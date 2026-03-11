import { formatEther } from 'viem'
import {
  YieldTokenDailySnapshot,
  YieldRTokenDailySnapshot,
  YieldDTFInput,
  YieldDTFMonthlyMetrics,
} from './types'
import {
  timestampToDateKey,
  timestampToMonthKey,
} from '../dtf-analytics/fetch-price-history'

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
}

function parseBigIntD18(value: string | undefined): number {
  if (!value || value === '0') return 0
  try {
    return +formatEther(BigInt(value))
  } catch {
    return 0
  }
}

interface MonthlyAccumulator {
  monthlyMinted: number
  monthlyBurned: number
  holderRevenueUsd: number
  stakerRevenueUsd: number

  totalSupply: number
  price: number
  marketCap: number
  holderCount: number
  rsrStaked: number
  rsrStakedUsd: number
  rsrExchangeRate: number
  rsrPrice: number
  lastTimestamp: number
}

function createEmptyAccumulator(): MonthlyAccumulator {
  return {
    monthlyMinted: 0,
    monthlyBurned: 0,
    holderRevenueUsd: 0,
    stakerRevenueUsd: 0,
    totalSupply: 0,
    price: 0,
    marketCap: 0,
    holderCount: 0,
    rsrStaked: 0,
    rsrStakedUsd: 0,
    rsrExchangeRate: 0,
    rsrPrice: 0,
    lastTimestamp: 0,
  }
}

/**
 * Derives staker revenue from rsrExchangeRate changes.
 * When revenue is distributed to stakers, the exchange rate increases.
 * Daily staker revenue (USD) = rsrStaked × (rateChange / prevRate) × rsrPrice
 */
function deriveStakerRevenue(
  snapshots: YieldRTokenDailySnapshot[]
): Map<string, number> {
  const revenueByDate = new Map<string, number>()
  const sorted = [...snapshots].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const prevRate = parseFloat(prev.rsrExchangeRate) || 0
    const currRate = parseFloat(curr.rsrExchangeRate) || 0
    const rsrStaked = parseBigIntD18(curr.rsrStaked)
    const rsrPrice = parseFloat(curr.rsrPrice) || 0

    if (prevRate > 0 && currRate > prevRate) {
      const dailyRevenue = rsrStaked * ((currRate - prevRate) / prevRate) * rsrPrice
      const dateKey = timestampToDateKey(Number(curr.timestamp))
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + dailyRevenue)
    }
  }

  return revenueByDate
}

/**
 * Derives holder revenue from basketRate changes.
 * When revenue is distributed to holders, the basketRate increases
 * (each RToken is backed by more underlying collateral).
 * Daily holder revenue (USD) = supply × (rateChange / prevRate) × price
 */
function deriveHolderRevenue(
  snapshots: YieldTokenDailySnapshot[]
): Map<string, number> {
  const revenueByDate = new Map<string, number>()
  const sorted = [...snapshots].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp)
  )

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const prevRate = parseFloat(prev.basketRate) || 0
    const currRate = parseFloat(curr.basketRate) || 0
    const supply = parseBigIntD18(curr.dailyTotalSupply)
    const price = parseFloat(curr.priceUSD) || 0

    if (prevRate > 0 && currRate > prevRate) {
      const dailyRevenue = supply * ((currRate - prevRate) / prevRate) * price
      const dateKey = timestampToDateKey(Number(curr.timestamp))
      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + dailyRevenue)
    }
  }

  return revenueByDate
}

export function calculateMetrics(
  dtf: YieldDTFInput,
  tokenSnapshots: YieldTokenDailySnapshot[],
  rTokenSnapshots: YieldRTokenDailySnapshot[]
): YieldDTFMonthlyMetrics[] {
  if (tokenSnapshots.length === 0) return []

  // Derive daily revenues from rate changes (uses full window incl. buffer)
  const stakerRevenueByDate = deriveStakerRevenue(rTokenSnapshots)
  const holderRevenueByDate = deriveHolderRevenue(tokenSnapshots)

  // Index rToken snapshots by date for month-end values
  const rTokenByDate: Record<string, YieldRTokenDailySnapshot> = {}
  for (const snap of rTokenSnapshots) {
    rTokenByDate[timestampToDateKey(Number(snap.timestamp))] = snap
  }

  // Group by month
  const monthlyData = new Map<string, MonthlyAccumulator>()

  for (const snap of tokenSnapshots) {
    const ts = Number(snap.timestamp)
    const monthKey = timestampToMonthKey(ts)
    const dateKey = timestampToDateKey(ts)

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, createEmptyAccumulator())
    }
    const acc = monthlyData.get(monthKey)!

    const dailyMint = parseBigIntD18(snap.dailyMintAmount)
    const dailyBurn = parseBigIntD18(snap.dailyBurnAmount)
    const price = parseFloat(snap.priceUSD) || 0
    const supply = parseBigIntD18(snap.dailyTotalSupply)

    acc.monthlyMinted += dailyMint
    acc.monthlyBurned += dailyBurn
    acc.stakerRevenueUsd += stakerRevenueByDate.get(dateKey) || 0
    acc.holderRevenueUsd += holderRevenueByDate.get(dateKey) || 0

    // Month-end: keep latest
    if (ts >= acc.lastTimestamp) {
      acc.lastTimestamp = ts
      acc.totalSupply = supply
      acc.price = price
      acc.marketCap = supply * price
      acc.holderCount = snap.cumulativeUniqueUsers

      const rSnap = rTokenByDate[dateKey]
      if (rSnap) {
        const rsrStaked = parseBigIntD18(rSnap.rsrStaked)
        const rsrPrice = parseFloat(rSnap.rsrPrice) || 0
        acc.rsrStaked = rsrStaked
        acc.rsrStakedUsd = rsrStaked * rsrPrice
        acc.rsrExchangeRate = parseFloat(rSnap.rsrExchangeRate) || 0
        acc.rsrPrice = rsrPrice
      }
    }
  }

  // Convert to metrics array
  const results: YieldDTFMonthlyMetrics[] = []

  for (const [monthKey, acc] of monthlyData.entries()) {
    const [yearStr, monthStr] = monthKey.split('-')

    results.push({
      symbol: dtf.symbol,
      name: dtf.name,
      chainId: dtf.chainId,
      chainName: CHAIN_NAMES[dtf.chainId] || `Chain ${dtf.chainId}`,
      month: parseInt(monthStr, 10),
      year: parseInt(yearStr, 10),
      monthKey,

      totalSupply: acc.totalSupply,
      price: acc.price,
      marketCap: acc.marketCap,
      holderCount: acc.holderCount,

      monthlyMinted: acc.monthlyMinted,
      monthlyBurned: acc.monthlyBurned,
      holderRevenueUsd: acc.holderRevenueUsd,
      stakerRevenueUsd: acc.stakerRevenueUsd,
      totalRevenueUsd: acc.holderRevenueUsd + acc.stakerRevenueUsd,

      rsrStaked: acc.rsrStaked,
      rsrStakedUsd: acc.rsrStakedUsd,
      rsrExchangeRate: acc.rsrExchangeRate,
      rsrPrice: acc.rsrPrice,

      cumulativeMinted: 0,
      cumulativeBurned: 0,
      cumulativeHolderRevenueUsd: 0,
      cumulativeStakerRevenueUsd: 0,
      cumulativeTotalRevenueUsd: 0,
    })
  }

  // Sort chronologically
  results.sort((a, b) => a.monthKey.localeCompare(b.monthKey))

  // Calculate cumulative values
  let cumMinted = 0
  let cumBurned = 0
  let cumHolderRev = 0
  let cumStakerRev = 0
  let cumTotalRev = 0

  for (const m of results) {
    cumMinted += m.monthlyMinted
    cumBurned += m.monthlyBurned
    cumHolderRev += m.holderRevenueUsd
    cumStakerRev += m.stakerRevenueUsd
    cumTotalRev += m.totalRevenueUsd

    m.cumulativeMinted = cumMinted
    m.cumulativeBurned = cumBurned
    m.cumulativeHolderRevenueUsd = cumHolderRev
    m.cumulativeStakerRevenueUsd = cumStakerRev
    m.cumulativeTotalRevenueUsd = cumTotalRev
  }

  return results
}
