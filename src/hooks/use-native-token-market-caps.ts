import { useQuery } from '@tanstack/react-query'

type MarketCapData = {
  [coingeckoId: string]: number
}

type CoinGeckoResponse = {
  [id: string]: {
    usd: number
    usd_market_cap: number
  }
}

/**
 * Hook to fetch market cap data for native tokens from CoinGecko API
 * @param coingeckoIds - Array of CoinGecko IDs to fetch market caps for
 * @returns Market cap data keyed by CoinGecko ID
 */
export const useNativeTokenMarketCaps = (coingeckoIds: string[]) => {
  // Temporary API key - will be replaced with env variable in production
  const COINGECKO_API_KEY = 'CG-nsuW44Cm6etKxDWuhXvcSgjK'

  return useQuery<MarketCapData>({
    queryKey: ['native-token-market-caps', coingeckoIds],
    queryFn: async () => {
      if (!coingeckoIds.length) return {}

      // Filter out any empty strings and join
      const ids = coingeckoIds.filter(Boolean).join(',')

      if (!ids) return {}

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true`,
          {
            headers: {
              'x-cg-demo-api-key': COINGECKO_API_KEY,
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          console.error('CoinGecko API error:', response.status, response.statusText)
          return {}
        }

        const data: CoinGeckoResponse = await response.json()

        // Transform response to extract market caps
        const marketCaps: MarketCapData = {}

        Object.entries(data).forEach(([id, values]) => {
          if (values?.usd_market_cap) {
            marketCaps[id] = values.usd_market_cap
          }
        })

        return marketCaps
      } catch (error) {
        console.error('Failed to fetch market caps from CoinGecko:', error)
        return {}
      }
    },
    staleTime: 300000, // Cache for 5 minutes
    refetchInterval: 600000, // Refetch every 10 minutes
    enabled: coingeckoIds.length > 0,
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Format market cap value for display
 * @param marketCap - Market cap value in USD
 * @returns Formatted string (e.g., "1.2T", "456.7B", "89.1M")
 */
export const formatMarketCap = (marketCap: number): string => {
  if (!marketCap || marketCap === 0) return '—'

  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(1)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(1)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(1)}M`
  } else {
    return `$${(marketCap / 1e3).toFixed(1)}K`
  }
}