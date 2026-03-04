import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
  price: number
}

export type VoteLockPosition = {
  chainId: number
  token: Token
  underlying: {
    token: Token
  }
  rewards: Array<{
    token: Token
    amount: number
    amountUsd: number
  }>
  dtfs: Token[]
  lockedAmount: number
  lockedAmountUsd: number
  totalRewardAmountUsd: number
  avgDailyRewardAmountUsd: number
  apr: number
}

const useVoteLockPositions = () => {
  return useQuery({
    queryKey: ['vote-lock-positions'],
    queryFn: async () => {
      const response = await fetch(`${RESERVE_API}dtf/daos`)
      if (!response.ok) {
        throw new Error('Failed to fetch DTF daos')
      }
      const data = await response.json()

      return data as VoteLockPosition[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export default useVoteLockPositions
