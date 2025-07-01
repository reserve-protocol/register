import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

const DEFAULT_API_URL = 'https://api.reserve.org/'

/**
 * Hook to fetch price data for a token using Reserve API
 */
export function useChainlinkPrice(
  chainId: number,
  tokenAddress: Address,
  apiUrl?: string
): number | null {
  const { data } = useQuery({
    queryKey: ['chainlinkPrice', chainId, tokenAddress, apiUrl],
    queryFn: async () => {
      if (!tokenAddress) return null

      const baseUrl = apiUrl || DEFAULT_API_URL
      const url = `${baseUrl}current/prices?chainId=${chainId}&tokens=${tokenAddress}`

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch price: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          return data[0]?.price || null
        }

        return null
      } catch (error) {
        console.error('Error fetching token price:', error)
        return null
      }
    },
    enabled: !!chainId && !!tokenAddress,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 2,
  })

  return data ?? null
}
