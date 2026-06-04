import { useEffect, useState, useRef, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { TokenLiquidity } from '@/utils/liquidity'
import {
  fetchRebalanceLiquidity,
  toTokenLiquidity,
  LiquidityTrade,
  OndoInfo,
  OndoMarket,
} from '@/utils/rebalance-liquidity'
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

type LiquidityData = {
  liquidityMap: Record<string, TokenLiquidity>
  ondoMap: Record<string, OndoInfo>
  market: OndoMarket | null
}

const EMPTY: LiquidityData = { liquidityMap: {}, ondoMap: {}, market: null }

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

const buildResult = (
  assets: Awaited<ReturnType<typeof fetchRebalanceLiquidity>>['assets'],
  market: OndoMarket | null
): LiquidityData => {
  const liquidityMap: Record<string, TokenLiquidity> = {}
  const ondoMap: Record<string, OndoInfo> = {}
  for (const asset of assets) {
    liquidityMap[asset.address] = toTokenLiquidity(asset)
    if (asset.ondo) ondoMap[asset.address] = asset.ondo
  }
  return { liquidityMap, ondoMap, market }
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

  const buildTrades = (tokenList: TokenInfo[]): LiquidityTrade[] =>
    tokenList.map((t) => ({
      address: t.tokenAddress,
      side: t.type === 'surplus' ? 'sell' : 'buy',
      amountUsd: t.usdSize,
      price: rebalanceParams?.prices[t.tokenAddress]?.currentPrice ?? 0,
      decimals: tokenMap[t.tokenAddress]?.decimals ?? 18,
    }))

  const queryKey = [
    'rebalance-liquidity',
    tokens,
    chainId,
    rebalanceParams?.prices,
    ethPrice,
  ]

  const {
    data = EMPTY,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<LiquidityData>({
    queryKey,
    queryFn: async () => {
      if (!tokens.length || !rebalanceParams || !chainId) return EMPTY
      try {
        const res = await fetchRebalanceLiquidity(
          chainId,
          ethPrice,
          buildTrades(tokens)
        )
        return buildResult(res.assets, res.market)
      } catch {
        return EMPTY
      }
    },
    enabled: !!tokens.length && !!rebalanceParams && !!chainId && !!ethPrice,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const { liquidityMap, ondoMap, market } = data

  const retryToken = async (tokenAddress: string) => {
    const token = tokens.find((t) => t.tokenAddress === tokenAddress)
    if (!token || !rebalanceParams || !chainId || !ethPrice) return

    setRetryingTokens((prev) => new Set(prev).add(tokenAddress))
    try {
      const res = await fetchRebalanceLiquidity(
        chainId,
        ethPrice,
        buildTrades([token])
      )
      const asset = res.assets[0]
      if (!asset) return
      queryClient.setQueryData<LiquidityData>(queryKey, (old) => ({
        liquidityMap: {
          ...old?.liquidityMap,
          [tokenAddress]: toTokenLiquidity(asset),
        },
        ondoMap: asset.ondo
          ? { ...old?.ondoMap, [tokenAddress]: asset.ondo }
          : old?.ondoMap ?? {},
        market: res.market ?? old?.market ?? null,
      }))
    } finally {
      setRetryingTokens((prev) => {
        const next = new Set(prev)
        next.delete(tokenAddress)
        return next
      })
    }
  }

  return {
    tokens,
    liquidityMap,
    ondoMap,
    market,
    isLoading,
    isFetching,
    retryingTokens,
    refetch,
    retryToken,
  }
}

export default useRebalanceLiquidityCheck
