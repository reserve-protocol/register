import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { basketAtom } from '../../../atoms'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import {
  fetchRebalanceLiquidity,
  toTokenLiquidity,
} from '@/utils/rebalance-liquidity'
import {
  liquidityCheckStatusAtom,
  liquiditySimulationAmountAtom,
  tokenLiquidityMapAtom,
  TokenLiquidity,
} from '../atoms'

export const fetchLiquidityData = async (
  basket: Token[],
  chainId: number,
  amountPerToken: number
): Promise<Record<string, TokenLiquidity>> => {
  // nativePrice 0 makes reserve-api price the chain's own native token
  const { assets } = await fetchRebalanceLiquidity(
    chainId,
    0,
    basket.map((token) => ({
      address: token.address,
      side: 'buy',
      amountUsd: amountPerToken,
      price: token.price ?? 0,
      decimals: token.decimals,
    }))
  )

  return Object.fromEntries(
    assets.map((asset) => [asset.address.toLowerCase(), toTokenLiquidity(asset)])
  )
}

export const useLiquidityCheck = () => {
  const basket = useAtomValue(basketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const simulationAmount = useAtomValue(liquiditySimulationAmountAtom)
  const setStatus = useSetAtom(liquidityCheckStatusAtom)
  const setLiquidityMap = useSetAtom(tokenLiquidityMapAtom)

  const queryKey = useMemo(
    () => ['liquidity-check', chainId, simulationAmount, basket.map((t) => t.address).sort().join(',')],
    [chainId, simulationAmount, basket]
  )

  const query = useQuery({
    queryKey,
    queryFn: () => fetchLiquidityData(basket, chainId, simulationAmount),
    enabled: basket.length >= 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (query.isLoading || query.isFetching) {
      setStatus('loading')
    } else if (query.isError) {
      setStatus('error')
      // Set all tokens to 'failed' when the request fails
      const failedMap: Record<string, TokenLiquidity> = {}
      for (const token of basket) {
        failedMap[token.address.toLowerCase()] = {
          address: token.address,
          priceImpact: 0,
          liquidityLevel: 'failed',
          liquidityScore: 0,
        }
      }
      setLiquidityMap(failedMap)
    } else if (query.isSuccess) {
      setStatus('success')
      setLiquidityMap(query.data)
    } else {
      setStatus('idle')
    }
  }, [query.isLoading, query.isFetching, query.isError, query.isSuccess, query.data, setStatus, setLiquidityMap, basket])

  return query
}
