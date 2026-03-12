import { useEffect, useState, useRef, useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { TokenLiquidity, priceImpactToLevel, priceImpactToScore } from '@/utils/liquidity'
import { rebalanceMetricsAtom, rebalanceTokenMapAtom } from '../atoms'
import useRebalanceParams from './use-rebalance-params'

const DEFAULT_API_URL = 'https://api.reserve.org/'
const DEBOUNCE_DELAY = 1_000
const MIN_USD_SIZE = 100
const DUMMY_SIGNER = '0x0000000000000000000000000000000000000001' as Address

const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address

const WRAPPED_NATIVE: Record<number, Address> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  8453: '0x4200000000000000000000000000000000000006',
  56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
}

export const NATIVE_SYMBOL: Record<number, string> = {
  1: 'WETH',
  8453: 'WETH',
  56: 'WBNB',
  42161: 'WETH',
}

const isNativeToken = (address: string, chainId: number): boolean => {
  const lower = address.toLowerCase()
  return (
    lower === NATIVE_TOKEN.toLowerCase() ||
    lower === WRAPPED_NATIVE[chainId]?.toLowerCase()
  )
}

type ZapResult = {
  truePriceImpact: number
  priceImpact: number
}

type ZapResponse = {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

export type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  usdSize: number
  type: 'surplus' | 'deficit'
}

const convertUsdToTokenUnits = (
  usdAmount: number,
  price: number,
  decimals: number
): string => {
  if (!price || price === 0) return '0'
  const amount = usdAmount / price
  try {
    return parseUnits(amount.toFixed(6), decimals).toString()
  } catch {
    return '0'
  }
}

const fetchPriceImpact = async (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  chainId: number
): Promise<{ priceImpact: number | null; error?: string }> => {
  try {
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      signer: DUMMY_SIGNER,
      tokenIn,
      amountIn,
      tokenOut,
      slippage: '100',
      trade: 'true',
      bypassCache: 'false',
    })

    const url = `${DEFAULT_API_URL}api/zapper/${chainId}/swap?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return { priceImpact: null, error: `API ${response.status}` }

    const data: ZapResponse = await response.json()

    if (data.status === 'success' && data.result) {
      const impact =
        data.result.truePriceImpact !== undefined
          ? data.result.truePriceImpact
          : data.result.priceImpact
      return { priceImpact: impact }
    }

    return { priceImpact: null, error: data.error }
  } catch {
    return { priceImpact: null, error: 'Fetch failed' }
  }
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

      const results = await Promise.all(
        tokens.map(async (token): Promise<[string, TokenLiquidity]> => {
          if (isNativeToken(token.tokenAddress, chainId)) {
            return [
              token.tokenAddress,
              {
                address: token.tokenAddress as Address,
                priceImpact: 0,
                liquidityLevel: 'high',
                liquidityScore: 100,
              },
            ]
          }

          // Surplus: selling token for native (token → native)
          // Deficit: buying token with native (native → token)
          const isSurplus = token.type === 'surplus'
          const tokenData = tokenMap[token.tokenAddress]
          const simulationUsd = Math.max(token.usdSize, MIN_USD_SIZE)

          let tokenIn: Address
          let tokenOut: Address
          let amountIn: string

          if (isSurplus) {
            const decimals = tokenData?.decimals ?? 18
            const price = rebalanceParams.prices[token.tokenAddress]?.currentPrice ?? 0
            amountIn = convertUsdToTokenUnits(simulationUsd, price, decimals)
            tokenIn = token.tokenAddress as Address
            tokenOut = NATIVE_TOKEN
          } else {
            amountIn = convertUsdToTokenUnits(simulationUsd, ethPrice, 18)
            tokenIn = NATIVE_TOKEN
            tokenOut = token.tokenAddress as Address
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

          const { priceImpact, error } = await fetchPriceImpact(
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
