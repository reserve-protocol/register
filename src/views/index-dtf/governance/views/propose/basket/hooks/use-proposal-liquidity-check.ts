import { useEffect, useState, useRef, useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import {
  TokenLiquidity,
  priceImpactToLevel,
  priceImpactToScore,
} from '@/utils/liquidity'
import {
  NATIVE_TOKEN,
  NATIVE_SYMBOL,
  MIN_USD_SIZE,
  isNativeToken,
  convertUsdToTokenUnits,
  fetchPriceImpact,
  fetchZapperTokens,
} from '@/utils/zapper'
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
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedShares(proposedShares)
      setDebouncedDerived(derivedShares)
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
      prices[address] ?? prices[address.toLowerCase()] ?? 0
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
        token.decimals
      )
      counterpart = cp?.tokenSymbol ?? (NATIVE_SYMBOL[chainId] ?? 'WETH')
    } else {
      const cp = largestSurplus ?? null
      tokenIn = cp ? (cp.tokenAddress as Address) : NATIVE_TOKEN
      tokenOut = token.tokenAddress as Address
      const price = cp ? getTokenPrice(cp.tokenAddress) : ethPrice
      const decimals = cp ? cp.decimals : 18
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

  const queryKey = ['proposal-liquidity', tokens, chainId, prices, ethPrice]

  const {
    data: { liquidityMap, unsupportedTokens } = {
      liquidityMap: {} as Record<string, TokenLiquidity>,
      unsupportedTokens: new Set<string>(),
    },
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tokens.length || !chainId) {
        return {
          liquidityMap: {} as Record<string, TokenLiquidity>,
          unsupportedTokens: new Set<string>(),
        }
      }

      const supportedTokens = await fetchZapperTokens(chainId)

      const unsupported = new Set<string>()
      for (const token of tokens) {
        if (
          !isNativeToken(token.tokenAddress, chainId) &&
          supportedTokens.size > 0 &&
          !supportedTokens.has(token.tokenAddress)
        ) {
          unsupported.add(token.tokenAddress)
        }
      }

      const results = await Promise.all(
        tokens.map((t) => fetchTokenLiquidity(t, tokens))
      )

      return {
        liquidityMap: Object.fromEntries(results) as Record<
          string,
          TokenLiquidity
        >,
        unsupportedTokens: unsupported,
      }
    },
    enabled: !!tokens.length && !!chainId && !!ethPrice,
    staleTime: 30_000,
  })

  const retryToken = async (tokenAddress: string) => {
    const token = tokens.find((t) => t.tokenAddress === tokenAddress)
    if (!token || !chainId || !ethPrice) return

    setRetryingTokens((prev) => new Set(prev).add(tokenAddress))
    try {
      const [, result] = await fetchTokenLiquidity(token, tokens)
      queryClient.setQueryData(
        queryKey,
        (
          old:
            | {
                liquidityMap: Record<string, TokenLiquidity>
                unsupportedTokens: Set<string>
              }
            | undefined
        ) => ({
          unsupportedTokens: old?.unsupportedTokens ?? new Set<string>(),
          liquidityMap: { ...old?.liquidityMap, [tokenAddress]: result },
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

  return { tokens, liquidityMap, unsupportedTokens, isLoading, isFetching, retryingTokens, refetch, retryToken }
}

export default useProposalLiquidityCheck
