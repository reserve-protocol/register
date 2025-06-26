import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { AssetPrice, DTFPrice } from '@/types/prices'
import { RESERVE_API } from '@/utils/constants'
import { useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import dtfIndexAbi from '@/abis/dtf-index-abi'

type FolioResult = {
  status: 'success' | 'failure'
  result?: any
  error?: Error
}

async function fetchPrices<T>(endpoint: string): Promise<T[]> {
  const url = `${RESERVE_API}${endpoint}`

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

export const useAssetPrices = (tokens?: Address[], chainId?: number) => {
  return useQuery({
    queryKey: ['asset-prices', tokens, chainId],
    queryFn: () =>
      fetchPrices<AssetPrice>(
        `current/prices?tokens=${tokens?.join(',')}&chainId=${chainId}`
      ),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!tokens?.length,
  })
}

export const useDTFPrices = (addresses?: Address[], chainId?: number) => {
  return useQuery({
    queryKey: ['dtf-prices', addresses, chainId],
    queryFn: () =>
      fetchPrices<DTFPrice>(
        `current/dtfs?addresses=${addresses?.join(',')}&chainId=${chainId}`
      ),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!addresses?.length,
  })
}

export const usePrices = (assets: Address[], chainId?: number) => {
  const { data: folioCalls } = useReadContracts<FolioResult[]>({
    contracts: assets.map((asset) => ({
      abi: dtfIndexAbi,
      address: asset,
      functionName: 'folio',
      chainId,
    })),
    allowFailure: true,
  })

  const { dtfRewards, erc20Rewards } = useMemo(() => {
    if (!folioCalls || !assets) {
      return { dtfRewards: [], erc20Rewards: [] }
    }

    const dtfRewardsList: Address[] = []
    const erc20RewardsList: Address[] = []

    folioCalls.forEach((result: FolioResult, index: number) => {
      if (result.status === 'success') {
        dtfRewardsList.push(assets[index])
      } else {
        erc20RewardsList.push(assets[index])
      }
    })

    return { dtfRewards: dtfRewardsList, erc20Rewards: erc20RewardsList }
  }, [folioCalls, assets])

  const { data: dtfPrices } = useDTFPrices(dtfRewards, chainId)
  const { data: erc20Prices } = useAssetPrices(erc20Rewards, chainId)

  const prices = useMemo(() => {
    const result: Record<Address, number | undefined> = {}

    dtfPrices?.forEach((price) => {
      result[price.address] = price.price
    })

    erc20Prices?.forEach((price) => {
      result[price.address] = price.price
    })

    return result
  }, [dtfPrices, erc20Prices])

  return prices
}
