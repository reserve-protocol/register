import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { AssetPrice, DTFPrice } from '@/types/prices'
import { RESERVE_API } from '@/utils/constants'

async function fetchPrices<T>(
  endpoint: string,
  tokens?: Address[]
): Promise<T[]> {
  if (!tokens?.length) return []

  const url = `${RESERVE_API}${endpoint}${tokens.join(',')}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch prices')
    }
    const result = await response.json()
    if (result?.statusCode) {
      throw new Error(result.message)
    }
    return result
  } catch (error) {
    console.error('Error fetching prices:', error)
    throw error
  }
}

export const useAssetPrices = (tokens?: Address[]) => {
  return useQuery({
    queryKey: ['asset-prices', tokens],
    queryFn: () => fetchPrices<AssetPrice>('current/prices?tokens=', tokens),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!tokens?.length,
  })
}

export const useDTFPrices = (addresses?: Address[]) => {
  return useQuery({
    queryKey: ['dtf-prices', addresses],
    queryFn: () => fetchPrices<DTFPrice>('current/dtfs?addresses=', addresses),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!addresses?.length,
  })
}
