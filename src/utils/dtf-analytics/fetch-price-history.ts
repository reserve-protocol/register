import { RESERVE_API } from '@/utils/constants'
import { Address } from 'viem'
import { PriceMap, DailyPrice } from './types'

// DTF historical price response
interface DTFPriceHistoryResponse {
  address: string
  timeseries: {
    timestamp: number
    price: number
    marketCap: number
    totalSupply: number
    basket: { address: string; price: number; amount: number }[]
  }[]
}

// Token historical price response (for RSR, vote lock tokens)
interface TokenPriceHistoryResponse {
  address: string
  timeseries: {
    price: number
    timestamp: number
  }[]
}

/**
 * Converts a timestamp to YYYY-MM-DD date key
 */
export function timestampToDateKey(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts a timestamp to YYYY-MM month key
 */
export function timestampToMonthKey(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Fetches DTF historical prices from Reserve API
 * Returns a map of date -> price for easy lookup
 */
export async function fetchDTFPriceHistory(
  dtfAddress: Address,
  chainId: number,
  from: number,
  to: number
): Promise<PriceMap> {
  const priceMap: PriceMap = {}

  try {
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      address: dtfAddress.toLowerCase(),
      from: from.toString(),
      to: to.toString(),
      interval: '1d',
    })

    const response = await fetch(
      `${RESERVE_API}historical/dtf?${params.toString()}`
    )

    if (!response.ok) {
      console.error(`Failed to fetch DTF price history: ${response.status}`)
      return priceMap
    }

    const data: DTFPriceHistoryResponse = await response.json()

    for (const point of data.timeseries) {
      const dateKey = timestampToDateKey(point.timestamp)
      priceMap[dateKey] = point.price
    }
  } catch (error) {
    console.error(`Error fetching DTF price history for ${dtfAddress}:`, error)
  }

  return priceMap
}

/**
 * Fetches token historical prices from Reserve API
 * Works for any token (RSR, vote lock underlying tokens, etc.)
 */
export async function fetchTokenPriceHistory(
  tokenAddress: Address,
  chainId: number,
  from: number,
  to: number
): Promise<PriceMap> {
  const priceMap: PriceMap = {}

  try {
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      from: from.toString(),
      to: to.toString(),
      interval: '1d',
      address: tokenAddress.toLowerCase(),
    })

    const response = await fetch(
      `${RESERVE_API}historical/prices?${params.toString()}`
    )

    if (!response.ok) {
      console.error(`Failed to fetch token price history: ${response.status}`)
      return priceMap
    }

    const data: TokenPriceHistoryResponse = await response.json()

    for (const point of data.timeseries) {
      const dateKey = timestampToDateKey(point.timestamp)
      priceMap[dateKey] = point.price
    }
  } catch (error) {
    console.error(
      `Error fetching token price history for ${tokenAddress}:`,
      error
    )
  }

  return priceMap
}

// RSR address on Ethereum mainnet - always use this for pricing
// RSR is fungible across chains, and mainnet has the most reliable price data
const RSR_ADDRESS_MAINNET: Address = '0x320623b8E4fF03373931769A31Fc52A4E78B5d70'
const MAINNET_CHAIN_ID = 1

/**
 * Fetches RSR historical prices
 * Always uses Ethereum mainnet for RSR pricing since it's the most reliable source
 * RSR is fungible across all chains so the price is the same
 */
export async function fetchRSRPriceHistory(
  _chainId: number, // Ignored - always use mainnet
  from: number,
  to: number
): Promise<PriceMap> {
  return fetchTokenPriceHistory(RSR_ADDRESS_MAINNET, MAINNET_CHAIN_ID, from, to)
}

/**
 * Gets price for a specific date from a price map
 * Falls back to nearest available price if exact date not found
 */
export function getPriceForDate(
  priceMap: PriceMap,
  dateKey: string
): number | null {
  // First try exact match
  if (priceMap[dateKey] !== undefined) {
    return priceMap[dateKey]
  }

  // Find nearest available date
  const dates = Object.keys(priceMap).sort()
  if (dates.length === 0) return null

  // Find closest date
  const targetDate = new Date(dateKey)
  let closestDate = dates[0]
  let minDiff = Math.abs(
    new Date(closestDate).getTime() - targetDate.getTime()
  )

  for (const date of dates) {
    const diff = Math.abs(new Date(date).getTime() - targetDate.getTime())
    if (diff < minDiff) {
      minDiff = diff
      closestDate = date
    }
  }

  return priceMap[closestDate]
}

/**
 * Gets the last price in a month from a price map
 */
export function getMonthEndPrice(
  priceMap: PriceMap,
  year: number,
  month: number
): number | null {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  // Find all dates in this month
  const datesInMonth = Object.keys(priceMap)
    .filter((d) => d.startsWith(monthKey))
    .sort()

  if (datesInMonth.length === 0) return null

  // Return last date's price
  return priceMap[datesInMonth[datesInMonth.length - 1]]
}

/**
 * Calculates monthly average price from daily prices
 */
export function getMonthlyAveragePrice(
  priceMap: PriceMap,
  year: number,
  month: number
): number | null {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  // Find all dates in this month
  const prices = Object.entries(priceMap)
    .filter(([d]) => d.startsWith(monthKey))
    .map(([, p]) => p)

  if (prices.length === 0) return null

  return prices.reduce((sum, p) => sum + p, 0) / prices.length
}
