import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { PortfolioTransaction } from '../types'
import { Address } from 'viem'

const fetchTransactions = async (
  address: Address
): Promise<PortfolioTransaction[]> => {
  const response = await fetch(
    `${RESERVE_API}v1/portfolio/${address}/transactions`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  return response.json()
}

export const useTransactions = (address?: Address | null) => {
  return useQuery({
    queryKey: ['portfolio-transactions', address],
    queryFn: () => fetchTransactions(address!),
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
