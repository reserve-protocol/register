import { monthKeys } from '../components/net-performance-summary'
import type {
  MonthlyChartDataPoint,
  NetPerformanceYear,
} from '../types/factsheet-data'

// Helper function to calculate performance percentage
export const calculatePerformance = (
  currentPrice: number,
  pastPrice: number | null | undefined
): number | null => {
  if (pastPrice == null || pastPrice === 0) return null
  return (currentPrice / pastPrice - 1) * 100
}

// Assumes allTimeseries is sorted by timestamp asc (if no, sort it once)
type Point = { timestamp: number; price: number }

// Binary search: index of the last point with timestamp <= target, or -1 if none.
function idxAtOrBefore(timeseries: Point[], targetTs: number): number {
  let lo = 0,
    hi = timeseries.length - 1,
    ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    const t = timeseries[mid].timestamp
    if (t <= targetTs) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

// Get price at or before target; if none, fallback to first at or after.
export function priceAtBoundary(
  timeseries: Point[],
  targetTs: number
): number | null {
  if (timeseries.length === 0) return null
  const i = idxAtOrBefore(timeseries, targetTs)
  if (i >= 0) return timeseries[i].price
  // fallback: first point after the boundary (series starts after boundary)
  const after = timeseries.find((p) => p.timestamp >= targetTs)
  return after ? after.price : null
}

type MonthKey = (typeof monthKeys)[number]
const monthIndexToKey = (i: number): MonthKey => monthKeys[i] as MonthKey

/**
 * Generates a year-by-year summary of net performance from a price time series.
 *
 * For each year:
 * - Splits data by calendar month, using the first and last price in each month.
 * - Computes monthly return as: ((monthClose / prevMonthClose) - 1) * 100.
 *   If the previous month has no data, it searches backwards until it finds
 *   the most recent available close price (even from past years).
 * - Identifies the best and worst months (highest and lowest monthly return).
 * - Computes year-to-date (YTD) return as:
 *   (lastCloseOfYear / baseClose - 1) * 100,
 *   where baseClose is the last available close before the first month of the year.
 *   If no prior data exists, the first month’s close is used as the base
 *   (so the year starts at 0%).
 *
 * Returns an array of NetPerformanceYear objects, each containing:
 * - monthly returns for Jan–Dec (null if no data for that month),
 * - flags for best/worst months,
 * - the overall YTD performance for that year.
 */

export const generateNetPerformanceData = (
  timeseries: Array<{ timestamp: number; price: number }>
): NetPerformanceYear[] => {
  if (!timeseries?.length) return []

  // Ensure chronological order so monthly open/close are correct
  const sorted = [...timeseries].sort((a, b) => a.timestamp - b.timestamp)

  // Build year->month-> { open, close }
  const byYearMonth = new Map<
    number,
    Map<number, { open: number; close: number }>
  >()
  let minYear = Infinity
  let maxYear = -Infinity

  for (const p of sorted) {
    const d = new Date(p.timestamp * 1000)
    const y = d.getFullYear()
    const m = d.getMonth()
    minYear = Math.min(minYear, y)
    maxYear = Math.max(maxYear, y)
    if (!byYearMonth.has(y)) byYearMonth.set(y, new Map())
    const ym = byYearMonth.get(y)!
    if (!ym.has(m)) ym.set(m, { open: p.price, close: p.price })
    else ym.get(m)!.close = p.price
  }

  // Find the previous month's close (skip missing months backwards, across years)
  const getPrevMonthClose = (year: number, month: number): number | null => {
    let y = year
    let m = month - 1
    while (y >= minYear) {
      if (m < 0) {
        y -= 1
        m = 11
      }
      const ym = byYearMonth.get(y)
      if (ym && ym.has(m)) return ym.get(m)!.close
      if (y < minYear) break
      m -= 1
    }
    return null
  }

  const years: NetPerformanceYear[] = []

  for (let y = minYear; y <= maxYear; y++) {
    const ym = byYearMonth.get(y)
    const row: NetPerformanceYear = {
      year: y,
      jan: { value: null },
      feb: { value: null },
      mar: { value: null },
      apr: { value: null },
      may: { value: null },
      jun: { value: null },
      jul: { value: null },
      aug: { value: null },
      sep: { value: null },
      oct: { value: null },
      nov: { value: null },
      dec: { value: null },
      yearToDate: null,
    }

    let best: { key: MonthKey; v: number } | null = null
    let worst: { key: MonthKey; v: number } | null = null

    // Track first and last month with data in the year
    let firstMonthIndex: number | null = null
    let firstMonthClose: number | null = null
    let lastMonthCloseOfYear: number | null = null

    for (let m = 0; m < 12; m++) {
      if (!ym || !ym.has(m)) continue

      const key = monthIndexToKey(m)
      const { close } = ym.get(m)!
      const prevClose = getPrevMonthClose(y, m)

      // Monthly close-to-previous-close return
      let monthlyReturn: number | null = null
      if (prevClose !== null && prevClose > 0) {
        monthlyReturn = (close / prevClose - 1) * 100
      }

      row[key] = { value: monthlyReturn }

      if (monthlyReturn !== null) {
        if (!best || monthlyReturn > best.v) best = { key, v: monthlyReturn }
        if (!worst || monthlyReturn < worst.v) worst = { key, v: monthlyReturn }
      }

      if (firstMonthIndex === null) {
        firstMonthIndex = m
        firstMonthClose = close
      }
      lastMonthCloseOfYear = close
    }

    // Mark best and worst months within valid values
    if (best) row[best.key].isBest = true
    if (worst && (!best || worst.key !== best.key))
      row[worst.key].isWorst = true

    // Compute YTD once per year:
    // Base = previous close BEFORE the first month with data (searching backwards across months/years).
    // If no previous close exists, base = first price
    if (firstMonthIndex !== null && lastMonthCloseOfYear !== null) {
      const prevBeforeFirst = getPrevMonthClose(y, firstMonthIndex)
      const firstPriceOfYear = timeseries[0].price
      const ytdBase =
        prevBeforeFirst !== null && prevBeforeFirst > 0
          ? prevBeforeFirst
          : firstPriceOfYear

      if (ytdBase !== null && ytdBase > 0) {
        row.yearToDate = (lastMonthCloseOfYear / ytdBase - 1) * 100
      } else {
        row.yearToDate = null
      }
    } else {
      row.yearToDate = null
    }

    years.push(row)
  }

  return years
}

/**
 * Calculates monthly Profit & Loss (P&L) data from a timeseries of token prices.
 *
 * Process:
 * 1. Groups price data points by month.
 * 2. For each month, keeps track of the first and last observed price.
 * 3. Calculates monthly P&L as the percentage change between the last price
 *    of the current month and the last price of the previous month:
 *      monthlyPL = ((lastPrice_current - lastPrice_previous) / lastPrice_previous) * 100
 * 4. Normalizes each data point timestamp to the end of its month.
 *
 * Notes:
 * - The first month will have `monthlyPL = null` since there is no prior month to compare.
 * - Input timestamps are expected in seconds (UNIX epoch).
 * - Output data is sorted chronologically by month.
 *
 * @param timeseries Array of objects containing { timestamp, price }
 * @returns Array of { timestamp, monthlyPL } for each month
 */
export const calculateMonthlyChartData = (
  timeseries: Array<{ timestamp: number; price: number }>
): MonthlyChartDataPoint[] => {
  // 1) Sort data by timestamp (ascending)
  const sorted = [...timeseries].sort((a, b) => a.timestamp - b.timestamp)

  // 2) Group data by month, keeping track of first and last price
  const monthlyGroups = new Map<
    string,
    { firstTs: number; firstPrice: number; lastTs: number; lastPrice: number }
  >()

  for (const point of sorted) {
    const date = new Date(point.timestamp * 1000)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}` // month is 0–11
    const group = monthlyGroups.get(monthKey)

    if (!group) {
      // Initialize this month
      monthlyGroups.set(monthKey, {
        firstTs: point.timestamp,
        firstPrice: point.price,
        lastTs: point.timestamp,
        lastPrice: point.price,
      })
    } else {
      // Update last price and timestamp for this month
      group.lastTs = point.timestamp
      group.lastPrice = point.price
    }
  }

  // 3) Sort months chronologically
  const months = Array.from(monthlyGroups.entries()).sort((a, b) => {
    const [yearA, monthA] = a[0].split('-').map(Number)
    const [yearB, monthB] = b[0].split('-').map(Number)
    return yearA !== yearB ? yearA - yearB : monthA - monthB
  })

  // 4) Calculate monthly P&L using last price of each month vs last price of previous month
  return months.map(([, current], index) => {
    const monthlyPL =
      index === 0
        ? null // no previous month to compare
        : ((current.lastPrice - months[index - 1][1].lastPrice) /
            months[index - 1][1].lastPrice) *
          100

    // Use the end of month timestamp (normalized)
    const date = new Date(current.lastTs * 1000)
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59
    )
    const ts = Math.floor(endOfMonth.getTime() / 1000)

    return { timestamp: ts, monthlyPL }
  })
}
