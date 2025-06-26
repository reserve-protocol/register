import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { TEMP_TOKENS } from '@/views/index-dtf/deploy/steps/basket/temp-tokens'
import { useQuery } from '@tanstack/react-query'

const TOKENS_API = `${RESERVE_API}zapper/tokens?chainId=`

const useTokenList = (chainId: number) =>
  useQuery({
    queryKey: ['token-list', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(`${TOKENS_API}${chainId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch token list')
        }
        const data: Token[] = await response.json()

        if (chainId === ChainId.Base) {
          data.push(...TEMP_TOKENS)
        }

        return data
      } catch (error) {
        console.error('Error fetching token list:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  })

export default useTokenList
