import { useEffect, useState, useRef, useMemo } from 'react'
import { formatUnits } from 'viem'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import { TokenLiquidity } from '@/utils/liquidity'
import { isNativeToken, fetchZapperTokens } from '@/utils/zapper'
import {
  fetchRebalanceLiquidity,
  toTokenLiquidity,
  LiquidityTrade,
  OndoInfo,
  OndoMarket,
} from '@/utils/rebalance-liquidity'
import {
  proposedIndexBasketAtom,
  proposedSharesAtom,
  derivedProposedSharesAtom,
  basketInputTypeAtom,
  priceMapAtom,
  dtfSupplyAtom,
  IndexAssetShares,
} from '../atoms'

export type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  decimals: number
  usdSize: number
  type: 'surplus' | 'deficit'
}

type LiquidityData = {
  liquidityMap: Record<string, TokenLiquidity>
  ondoMap: Record<string, OndoInfo>
  market: OndoMarket | null
  unsupportedTokens: Set<string>
}

const EMPTY: LiquidityData = {
  liquidityMap: {},
  ondoMap: {},
  market: null,
  unsupportedTokens: new Set<string>(),
}

const DEBOUNCE_DELAY = 2_500

const getProposedShare = (
  address: string,
  asset: IndexAssetShares,
  basketInputType: string,
  proposedShares: Record<string, string>,
  derivedShares: Record<string, bigint> | undefined
): number => {
  if (basketInputType === 'unit' && derivedShares) {
    const val = derivedShares[address] ?? derivedShares[address.toLowerCase()]
    if (val !== undefined) return Number(formatUnits(val, 16))
  }
  const share = proposedShares[address] ?? proposedShares[address.toLowerCase()]
  return share !== undefined ? Number(share) : Number(asset.currentShares)
}

const getTokensFromProposal = (
  basket: Record<string, IndexAssetShares>,
  basketInputType: string,
  proposedShares: Record<string, string>,
  derivedShares: Record<string, bigint> | undefined,
  tvl: number
): TokenInfo[] => {
  const tokens: TokenInfo[] = []

  for (const [address, asset] of Object.entries(basket)) {
    const currentShare = Number(asset.currentShares)
    const proposedShare = getProposedShare(
      address,
      asset,
      basketInputType,
      proposedShares,
      derivedShares
    )
    const delta = proposedShare - currentShare

    if (Math.abs(delta) < 0.01) continue

    const usdSize = Math.abs(delta / 100) * tvl

    tokens.push({
      tokenAddress: address.toLowerCase(),
      tokenSymbol: asset.token.symbol,
      decimals: asset.token.decimals,
      usdSize,
      type: delta < 0 ? 'surplus' : 'deficit',
    })
  }

  return tokens
}

const useProposalLiquidityCheck = () => {
  const basket = useAtomValue(proposedIndexBasketAtom)
  const proposedShares = useAtomValue(proposedSharesAtom)
  const derivedShares = useAtomValue(derivedProposedSharesAtom)
  const basketInputType = useAtomValue(basketInputTypeAtom)
  const prices = useAtomValue(priceMapAtom)
  const supply = useAtomValue(dtfSupplyAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const queryClient = useQueryClient()

  const [debouncedShares, setDebouncedShares] = useState(proposedShares)
  const [debouncedDerived, setDebouncedDerived] = useState(derivedShares)
  const [retryingTokens, setRetryingTokens] = useState<Set<string>>(new Set())
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      return
    }
    setIsDebouncing(true)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedShares(proposedShares)
      setDebouncedDerived(derivedShares)
      setIsDebouncing(false)
    }, DEBOUNCE_DELAY)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [proposedShares, derivedShares])

  const tvl = useMemo(() => {
    if (!dtfPrice || !supply) return 0
    return (dtfPrice * Number(supply)) / 1e18
  }, [dtfPrice, supply])

  const tokens = useMemo(() => {
    if (!basket || tvl === 0) return []

    return getTokensFromProposal(
      basket,
      basketInputType,
      debouncedShares,
      debouncedDerived,
      tvl
    )
  }, [basket, debouncedShares, debouncedDerived, basketInputType, tvl])

  const priceOf = (address: string): number =>
    prices[address] ?? prices[address.toLowerCase()] ?? 0

  const buildTrades = (tokenList: TokenInfo[]): LiquidityTrade[] =>
    tokenList.map((t) => ({
      address: t.tokenAddress,
      side: t.type === 'surplus' ? 'sell' : 'buy',
      amountUsd: t.usdSize,
      price: priceOf(t.tokenAddress),
      decimals: t.decimals,
    }))

  const queryKey = ['proposal-liquidity', tokens, chainId, prices, ethPrice]

  const {
    data = EMPTY,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<LiquidityData>({
    queryKey,
    queryFn: async () => {
      if (!tokens.length || !chainId) return EMPTY

      // Flag tokens the aggregator can't route (unchanged client-side check).
      const supportedTokens = await fetchZapperTokens(chainId)
      const unsupportedTokens = new Set<string>()
      for (const token of tokens) {
        if (
          !isNativeToken(token.tokenAddress, chainId) &&
          supportedTokens.size > 0 &&
          !supportedTokens.has(token.tokenAddress)
        ) {
          unsupportedTokens.add(token.tokenAddress)
        }
      }

      const liquidityMap: Record<string, TokenLiquidity> = {}
      const ondoMap: Record<string, OndoInfo> = {}
      let market: OndoMarket | null = null
      try {
        const res = await fetchRebalanceLiquidity(
          chainId,
          ethPrice,
          buildTrades(tokens)
        )
        market = res.market
        for (const asset of res.assets) {
          liquidityMap[asset.address] = toTokenLiquidity(asset)
          if (asset.ondo) ondoMap[asset.address] = asset.ondo
        }
      } catch {
        // keep empty maps; unsupported-token info is still useful
      }

      return { liquidityMap, ondoMap, market, unsupportedTokens }
    },
    enabled: !!tokens.length && !!chainId && !!ethPrice,
    staleTime: 30_000,
  })

  const { liquidityMap, ondoMap, market, unsupportedTokens } = data

  const retryToken = async (tokenAddress: string) => {
    const token = tokens.find((t) => t.tokenAddress === tokenAddress)
    if (!token || !chainId || !ethPrice) return

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
        unsupportedTokens: old?.unsupportedTokens ?? new Set<string>(),
        market: res.market ?? old?.market ?? null,
        liquidityMap: {
          ...old?.liquidityMap,
          [tokenAddress]: toTokenLiquidity(asset),
        },
        ondoMap: asset.ondo
          ? { ...old?.ondoMap, [tokenAddress]: asset.ondo }
          : old?.ondoMap ?? {},
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
    unsupportedTokens,
    isLoading,
    isFetching,
    isDebouncing,
    retryingTokens,
    refetch,
    retryToken,
  }
}

export default useProposalLiquidityCheck
