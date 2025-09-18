import { NATIVE_TOKENS, type NativeToken } from './token-mappings'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_KEY_PREFIX = 'market_data_'

interface MarketData {
  marketCap: number
  price: number
  priceChange7d: number
  lastUpdated: number
}

interface CoinGeckoMarketData {
  id: string
  symbol: string
  market_cap: number
  current_price: number
  price_change_percentage_7d_in_currency: number
  image: string
}

// Cache management
function getCachedData(key: string): MarketData | null {
  try {
    const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${key}`)
    if (!cached) return null

    const data = JSON.parse(cached) as MarketData
    const now = Date.now()

    // Check if cache is still valid
    if (now - data.lastUpdated > CACHE_DURATION) {
      sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

function setCachedData(key: string, data: Omit<MarketData, 'lastUpdated'>): void {
  try {
    const cacheData: MarketData = {
      ...data,
      lastUpdated: Date.now(),
    }
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

// Fetch market data from CoinGecko
export async function fetchMarketData(
  nativeKeys: string[]
): Promise<Map<string, MarketData>> {
  const result = new Map<string, MarketData>()

  // Check cache first
  const keysToFetch: string[] = []
  for (const key of nativeKeys) {
    const cached = getCachedData(key)
    if (cached) {
      result.set(key, cached)
    } else {
      keysToFetch.push(key)
    }
  }

  if (keysToFetch.length === 0) {
    return result
  }

  // Build CoinGecko IDs list
  const coingeckoIds = keysToFetch
    .map((key) => NATIVE_TOKENS[key]?.coingeckoId)
    .filter(Boolean)
    .join(',')

  if (!coingeckoIds) {
    return result
  }

  try {
    // Fetch from CoinGecko
    const url = `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
      coingeckoIds
    )}&price_change_percentage=7d`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoMarketData[] = await response.json()

    // Map results back to native keys
    for (const key of keysToFetch) {
      const token = NATIVE_TOKENS[key]
      if (!token?.coingeckoId) continue

      const marketData = data.find((item) => item.id === token.coingeckoId)
      if (marketData) {
        const dataPoint = {
          marketCap: marketData.market_cap || 0,
          price: marketData.current_price || 0,
          priceChange7d: marketData.price_change_percentage_7d_in_currency || 0,
        }

        result.set(key, { ...dataPoint, lastUpdated: Date.now() })
        setCachedData(key, dataPoint)
      }
    }
  } catch (error) {
    console.error('Failed to fetch market data:', error)
  }

  return result
}

// Update native tokens with market data
export async function enrichNativeTokensWithMarketData(
  nativeKeys: string[]
): Promise<void> {
  const marketData = await fetchMarketData(nativeKeys)

  for (const [key, data] of marketData.entries()) {
    const token = NATIVE_TOKENS[key]
    if (token) {
      token.marketCap = data.marketCap
      token.price = data.price
      token.priceChange7d = data.priceChange7d
    }
  }
}

// Format market cap for display
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toFixed(2)}`
  }
}

// Format price change for display
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// Fallback to Alchemy for EVM tokens (optional)
export async function fetchPriceViaAlchemy(
  symbol: string,
  alchemyKey: string
): Promise<number | null> {
  try {
    const url = `https://api.g.alchemy.com/prices/v1/${alchemyKey}/tokens/by-symbol?symbols=${encodeURIComponent(
      symbol
    )}&currency=usd`
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    return data?.data?.prices?.[0]?.price ?? null
  } catch (error) {
    console.error('Alchemy price fetch error:', error)
    return null
  }
}

// Batch fetch prices via DefiLlama (alternative)
export async function fetchPricesViaDefiLlama(
  llamaKeys: string[]
): Promise<Record<string, number>> {
  try {
    const url = `https://coins.llama.fi/prices/current/${llamaKeys.join(',')}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('DefiLlama API error')

    const data = await response.json()
    const result: Record<string, number> = {}

    for (const [key, value] of Object.entries(data.coins || {})) {
      if (typeof value === 'object' && value && 'price' in value) {
        result[key] = (value as any).price
      }
    }

    return result
  } catch (error) {
    console.error('DefiLlama price fetch error:', error)
    return {}
  }
}