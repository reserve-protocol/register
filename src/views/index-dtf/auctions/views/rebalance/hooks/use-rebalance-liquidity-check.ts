import { useEffect, useState, useRef, useMemo } from 'react'
import { Address } from 'viem'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  const [debouncedMetrics, setDebouncedMetrics] = useState(metrics)
  const [retryingTokens, setRetryingTokens] = useState<Set<string>>(new Set())
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

  const fetchTokenLiquidity = async (
    token: TokenInfo,
    allTokens: TokenInfo[]
  ): Promise<[string, TokenLiquidity]> => {
    const surplusTokens = allTokens.filter((t) => t.type === 'surplus')
    const deficitTokens = allTokens.filter((t) => t.type === 'deficit')
    const largestSurplus = surplusTokens.length
      ? surplusTokens.reduce((a, b) => (b.usdSize > a.usdSize ? b : a))
      : null
    const largestDeficit = deficitTokens.length
      ? deficitTokens.reduce((a, b) => (b.usdSize > a.usdSize ? b : a))
      : null

    const getTokenPrice = (address: string): number =>
      rebalanceParams!.prices[address]?.currentPrice ?? 0
    const getTokenDecimals = (address: string): number =>
      tokenMap[address]?.decimals ?? 18
    const getNativeCounterpart = (t: TokenInfo): string | undefined =>
      t.type === 'surplus'
        ? largestDeficit?.tokenSymbol
        : largestSurplus?.tokenSymbol

    const simulationUsd = Math.max(token.usdSize, MIN_USD_SIZE)
    const isSurplus = token.type === 'surplus'
    const nativeCounterpart = isSurplus ? largestDeficit : largestSurplus

    if (
      isNativeToken(token.tokenAddress, chainId) &&
      (!nativeCounterpart ||
        isNativeToken(nativeCounterpart.tokenAddress, chainId))
    ) {
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

    let tokenIn: Address, tokenOut: Address, amountIn: string, counterpart: string

    if (isSurplus) {
      const cp = largestDeficit ?? null
      tokenIn = token.tokenAddress as Address
      tokenOut = cp ? (cp.tokenAddress as Address) : NATIVE_TOKEN
      amountIn = convertUsdToTokenUnits(
        simulationUsd,
        getTokenPrice(token.tokenAddress),
        getTokenDecimals(token.tokenAddress)
      )
      counterpart = cp?.tokenSymbol ?? (NATIVE_SYMBOL[chainId] ?? 'WETH')
    } else {
      const cp = largestSurplus ?? null
      tokenIn = cp ? (cp.tokenAddress as Address) : NATIVE_TOKEN
      tokenOut = token.tokenAddress as Address
      const price = cp ? getTokenPrice(cp.tokenAddress) : ethPrice
      const decimals = cp ? getTokenDecimals(cp.tokenAddress) : 18
      amountIn = convertUsdToTokenUnits(simulationUsd, price, decimals)
      counterpart = cp?.tokenSymbol ?? (NATIVE_SYMBOL[chainId] ?? 'WETH')
    }

    if (amountIn === '0') {
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
      tokenIn,
      tokenOut,
      amountIn,
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
        counterpart,
        swapPath,
      },
    ]
  }

  const queryKey = [
    'rebalance-liquidity',
    tokens,
    chainId,
    rebalanceParams?.prices,
    ethPrice,
  ]

  const {
    data: liquidityMap = {},
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tokens.length || !rebalanceParams || !chainId) return {}
      const results = await Promise.all(
        tokens.map((t) => fetchTokenLiquidity(t, tokens))
      )
      return Object.fromEntries(results) as Record<string, TokenLiquidity>
    },
    enabled:
      !!tokens.length && !!rebalanceParams && !!chainId && !!ethPrice,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const retryToken = async (tokenAddress: string) => {
    const token = tokens.find((t) => t.tokenAddress === tokenAddress)
    if (!token || !rebalanceParams || !chainId || !ethPrice) return

    setRetryingTokens((prev) => new Set(prev).add(tokenAddress))
    try {
      const [, result] = await fetchTokenLiquidity(token, tokens)
      queryClient.setQueryData(
        queryKey,
        (old: Record<string, TokenLiquidity> | undefined) => ({
          ...old,
          [tokenAddress]: result,
        })
      )
    } finally {
      setRetryingTokens((prev) => {
        const next = new Set(prev)
        next.delete(tokenAddress)
        return next
      })
    }
  }

  return { tokens, liquidityMap, isLoading, isFetching, retryingTokens, refetch, retryToken }
}

export default useRebalanceLiquidityCheck
