import { useEffect, useState, useRef, useMemo } from 'react'
import { Address } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { TokenLiquidity, priceImpactToLevel, priceImpactToScore } from '@/utils/liquidity'
import {
  NATIVE_TOKEN,
  NATIVE_SYMBOL,
  MIN_USD_SIZE,
  isNativeToken,
  convertUsdToTokenUnits,
  fetchPriceImpact,
} from '@/utils/zapper'
export { NATIVE_SYMBOL } from '@/utils/zapper'
import { rebalanceMetricsAtom, rebalanceTokenMapAtom } from '../atoms'
import useRebalanceParams from './use-rebalance-params'

const DEBOUNCE_DELAY = 1_000

export type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  usdSize: number
  type: 'surplus' | 'deficit'
}

const getAllTokensWithSizes = (
  metrics: any,
  tokenMap: Record<string, any>
): TokenInfo[] => {
  if (!metrics) return []

  const tokens: TokenInfo[] = []

  for (let i = 0; i < metrics.surplusTokens.length; i++) {
    const tokenAddress = metrics.surplusTokens[i].toLowerCase()
    const token = tokenMap[tokenAddress]
    if (token && metrics.surplusTokenSizes[i] > 0) {
      tokens.push({
        tokenAddress,
        tokenSymbol: token.symbol,
        usdSize: metrics.surplusTokenSizes[i],
        type: 'surplus',
      })
    }
  }

  for (let i = 0; i < metrics.deficitTokens.length; i++) {
    const tokenAddress = metrics.deficitTokens[i].toLowerCase()
    const token = tokenMap[tokenAddress]
    if (token && metrics.deficitTokenSizes[i] > 0) {
      tokens.push({
        tokenAddress,
        tokenSymbol: token.symbol,
        usdSize: metrics.deficitTokenSizes[i],
        type: 'deficit',
      })
    }
  }

  return tokens
}

const useRebalanceLiquidityCheck = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const chainId = useAtomValue(chainIdAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const rebalanceParams = useRebalanceParams()

  const [debouncedMetrics, setDebouncedMetrics] = useState(metrics)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedMetrics(metrics)
    }, DEBOUNCE_DELAY)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [metrics])

  const tokens = useMemo(
    () => getAllTokensWithSizes(debouncedMetrics, tokenMap),
    [debouncedMetrics, tokenMap]
  )

  const {
    data: liquidityMap = {},
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'rebalance-liquidity',
      tokens,
      chainId,
      rebalanceParams?.prices,
      ethPrice,
    ],
    queryFn: async () => {
      if (!tokens.length || !rebalanceParams || !chainId) return {}

      const surplusTokens = tokens.filter((t) => t.type === 'surplus')
      const deficitTokens = tokens.filter((t) => t.type === 'deficit')

      // Largest counterpart for matching
      const largestSurplus = surplusTokens.length
        ? surplusTokens.reduce((a, b) => (b.usdSize > a.usdSize ? b : a))
        : null
      const largestDeficit = deficitTokens.length
        ? deficitTokens.reduce((a, b) => (b.usdSize > a.usdSize ? b : a))
        : null

      const getTokenPrice = (address: string): number =>
        rebalanceParams.prices[address]?.currentPrice ?? 0

      const getTokenDecimals = (address: string): number =>
        tokenMap[address]?.decimals ?? 18

      const getNativeCounterpart = (token: TokenInfo): string | undefined =>
        token.type === 'surplus'
          ? largestDeficit?.tokenSymbol
          : largestSurplus?.tokenSymbol

      const resolveSwap = (
        token: TokenInfo
      ): { tokenIn: Address; tokenOut: Address; amountIn: string; counterpart: string } | null => {
        if (isNativeToken(token.tokenAddress, chainId)) return null

        const simulationUsd = Math.max(token.usdSize, MIN_USD_SIZE)
        const isSurplus = token.type === 'surplus'

        // Surplus: sell this token for the largest deficit (or native fallback)
        // Deficit: buy this token with the largest surplus (or native fallback)
        if (isSurplus) {
          const counterpart = largestDeficit ?? null
          const tokenOut = counterpart
            ? (counterpart.tokenAddress as Address)
            : NATIVE_TOKEN
          const amountIn = convertUsdToTokenUnits(
            simulationUsd,
            getTokenPrice(token.tokenAddress),
            getTokenDecimals(token.tokenAddress)
          )
          return {
            tokenIn: token.tokenAddress as Address,
            tokenOut,
            amountIn,
            counterpart: counterpart?.tokenSymbol ?? (NATIVE_SYMBOL[chainId] ?? 'WETH'),
          }
        }

        const counterpart = largestSurplus ?? null
        const tokenIn = counterpart
          ? (counterpart.tokenAddress as Address)
          : NATIVE_TOKEN
        const price = counterpart
          ? getTokenPrice(counterpart.tokenAddress)
          : ethPrice
        const decimals = counterpart
          ? getTokenDecimals(counterpart.tokenAddress)
          : 18
        const amountIn = convertUsdToTokenUnits(simulationUsd, price, decimals)
        return {
          tokenIn,
          tokenOut: token.tokenAddress as Address,
          amountIn,
          counterpart: counterpart?.tokenSymbol ?? (NATIVE_SYMBOL[chainId] ?? 'WETH'),
        }
      }

      const results = await Promise.all(
        tokens.map(async (token): Promise<[string, TokenLiquidity]> => {
          const swap = resolveSwap(token)

          if (!swap) {
            return [
              token.tokenAddress,
              {
                address: token.tokenAddress as Address,
                priceImpact: 0,
                liquidityLevel: 'high',
                liquidityScore: 100,
                counterpart: getNativeCounterpart(token),
              },
            ]
          }

          if (swap.amountIn === '0') {
            return [
              token.tokenAddress,
              {
                address: token.tokenAddress as Address,
                priceImpact: 0,
                liquidityLevel: 'unknown',
                liquidityScore: 50,
              },
            ]
          }

          const { priceImpact, error, swapPath } = await fetchPriceImpact(
            swap.tokenIn,
            swap.tokenOut,
            swap.amountIn,
            chainId
          )

          if (priceImpact === null) {
            return [
              token.tokenAddress,
              {
                address: token.tokenAddress as Address,
                priceImpact: 0,
                liquidityLevel: 'error',
                liquidityScore: 0,
                error,
              },
            ]
          }

          return [
            token.tokenAddress,
            {
              address: token.tokenAddress as Address,
              priceImpact,
              liquidityLevel: priceImpactToLevel(priceImpact),
              liquidityScore: priceImpactToScore(priceImpact),
              counterpart: swap.counterpart,
              swapPath,
            },
          ]
        })
      )

      return Object.fromEntries(results) as Record<string, TokenLiquidity>
    },
    enabled:
      !!tokens.length && !!rebalanceParams && !!chainId && !!ethPrice,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  return { tokens, liquidityMap, isLoading, isFetching }
}

export default useRebalanceLiquidityCheck
