import { chainIdAtom } from '@/state/atoms'
import { Volatility } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useTokenList from './use-token-list'

const useAssetPriceVolatility = (assets: string[]) => {
  const chainId = useAtomValue(chainIdAtom)
  const { data: tokens } = useTokenList(chainId)

  return useMemo(() => {
    if (!tokens || !assets.length) return undefined

    const tokenMap = new Map(
      tokens.map((token) => [token.address.toLowerCase(), token])
    )

    return assets.reduce(
      (acc, token) => {
        let tokenVolatility =
          tokenMap.get(token.toLowerCase())?.volatility || 'medium'

        acc[token.toLowerCase()] = tokenVolatility

        return acc
      },
      {} as Record<string, Volatility>
    )
  }, [tokens, assets])
}

export default useAssetPriceVolatility
