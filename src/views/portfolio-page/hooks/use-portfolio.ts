import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { PortfolioResponse } from '../types'
import { Address } from 'viem'

const fetchPortfolio = async (address: Address): Promise<PortfolioResponse> => {
  const response = await fetch(`${RESERVE_API}v1/portfolio/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio')
  }
  return response.json()
}

export const usePortfolio = (address?: Address | null) => {
  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => fetchPortfolio(address!),
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
