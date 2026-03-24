import { Token, Volatility } from '@/types'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

const getTokensApi = (chain: number, unfiltered = false) =>
  `${RESERVE_API}zapper/tokens?chainId=${chain}${unfiltered ? '&unfiltered=true' : ''}`

type ZapToken = Token & {
  volatility: Volatility
}

const useTokenList = (
  chainId: number,
  { unfiltered = false }: { unfiltered?: boolean } = {}
) =>
  useQuery({
    queryKey: ['token-list', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(getTokensApi(chainId, unfiltered))
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
