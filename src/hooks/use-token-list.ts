import { Token, Volatility } from '@/types'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

const getTokensApi = (chain: number) =>
  `${RESERVE_API}zapper/tokens?chainId=${chain}`

type ZapToken = Token & {
  volatility: Volatility
}

const useTokenList = (chainId: number) =>
  useQuery({
    queryKey: ['token-list', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(getTokensApi(chainId))
        if (!response.ok) {
          throw new Error('Failed to fetch token list')
        }
        const data: ZapToken[] = await response.json()

        return data
      } catch (error) {
        console.error('Error fetching token list:', error)
        throw error
      }
    },
    retry: 2,
  })

export default useTokenList
