import useTokenList from '@/hooks/use-token-list'
import { chainIdAtom } from '@/state/atoms'
import { Volatility } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { currentRebalanceAtom } from '../../../atoms'
import { priceVolatilityAtom } from '../atoms'

const volatilityOrder: Volatility[] = ['low', 'medium', 'high', 'degen']

const useRebalancePriceVolatility = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { data: tokens } = useTokenList(chainId)
  const userDefinedVolatility = useAtomValue(priceVolatilityAtom) // user defined volatility
  const rebalance = useAtomValue(currentRebalanceAtom)

  return useMemo(() => {
    if (!tokens || !rebalance) return undefined

    const tokenMap = new Map(
      tokens.map((token) => [token.address.toLowerCase(), token])
    )

    return rebalance.rebalance.tokens.reduce(
      (acc, token) => {
        let tokenVolatility =
          tokenMap.get(token.address.toLowerCase())?.volatility || 'medium'

        // If the user "overrided" the volatility, use the user defined volatility if it's higher than the api defined volatility
        if (userDefinedVolatility !== 'medium') {
          const userDefinedIndex = volatilityOrder.indexOf(
            userDefinedVolatility
          )
          const apiDefinedIndex = volatilityOrder.indexOf(tokenVolatility)

          if (apiDefinedIndex < userDefinedIndex) {
            tokenVolatility = userDefinedVolatility
          }
        }

        acc[token.address.toLowerCase()] = tokenVolatility

        return acc
      },
      {} as Record<string, Volatility>
    )
  }, [tokens, rebalance, userDefinedVolatility])
}

export default useRebalancePriceVolatility
