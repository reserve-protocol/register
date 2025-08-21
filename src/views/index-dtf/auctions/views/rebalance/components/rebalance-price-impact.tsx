import { useAtomValue } from 'jotai'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { chainIdAtom } from '@/state/atoms'
import { ethPriceAtom } from '@/state/chain/atoms/chainAtoms'
import { formatCurrency } from '@/utils'
import { rebalanceMetricsAtom, rebalanceTokenMapAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import { Skeleton } from '@/components/ui/skeleton'

// ==================== CONSTANTS ====================
const DEFAULT_API_URL = 'https://api.reserve.org/'
const DEBOUNCE_DELAY = 1000
const DUMMY_SIGNER = '0x0000000000000000000000000000000000000001' as Address

const WETH_ADDRESSES: Record<number, Address> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum
  8453: '0x4200000000000000000000000000000000000006', // Base
  56: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // BSC
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
}

// ==================== TYPES ====================
type ZapResult = {
  tokenIn: Address
  amountIn: string
  amountInValue: number | null
  tokenOut: Address
  amountOut: string
  amountOutValue: number | null
  minAmountOut?: string
  approvalAddress: Address
  approvalNeeded: boolean
  insufficientFunds: boolean
  dust: {
    token: string
    amount: string
  }[]
  dustValue: number | null
  gas: string | null
  priceImpact: number // 0.0% => no impact | 10 => 10% impact
  truePriceImpact: number // -10% => positive impact,  10 => 10% negative impact
  tx: {
    data: string
    to: Address
    value: string
  } | null
}

type ZapResponse = {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  usdSize: number
  type: 'surplus' | 'deficit'
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert USD amount to token units
 */
const convertUsdToTokenUnits = (
  usdAmount: number,
  price: number | undefined,
  decimals: number | undefined
): string => {
  if (!decimals || !price || price === 0) return '0'

  const tokenAmount = usdAmount / price

  try {
    return parseUnits(tokenAmount.toFixed(6), decimals).toString()
  } catch (error) {
    console.error('Error parsing units:', error, {
      tokenAmount,
      decimals,
    })
    return '0'
  }
}

/**
 * Fetch price impact from API
 */
const fetchPriceImpact = async (
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  chainId: number
): Promise<number | null> => {
  try {
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      signer: DUMMY_SIGNER,
      tokenIn,
      amountIn,
      tokenOut,
      slippage: '100', // 1% = 100 basis points
      trade: 'true',
      bypassCache: 'false',
    })

    const url = `${DEFAULT_API_URL}api/zapper/${chainId}/swap?${params.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(
        'API response not ok:',
        response.status,
        response.statusText
      )
      return null
    }

    const data: ZapResponse = await response.json()

    if (data.status === 'success' && data.result) {
      // Use truePriceImpact if available, otherwise fall back to priceImpact
      const impact =
        data.result.truePriceImpact !== undefined
          ? data.result.truePriceImpact
          : data.result.priceImpact

      return impact
    }

    if (data.error) {
      console.error('API error:', data.error)
    }

    return null
  } catch (error) {
    console.error('Error fetching price impact:', error)
    return null
  }
}

/**
 * Get all tokens with their sizes
 */
const getAllTokensWithSizes = (
  metrics: any,
  tokenMap: Record<string, any>
): TokenInfo[] => {
  if (!metrics) return []

  const tokens: TokenInfo[] = []

  // Add surplus tokens
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

  // Add deficit tokens
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

// ==================== SUB-COMPONENTS ====================

/**
 * Individual token impact row with inline skeleton
 */
const TokenImpactRow = ({ 
  token,
  priceImpact,
  isLoading 
}: { 
  token: TokenInfo
  priceImpact: number | null | undefined
  isLoading: boolean
}) => (
  <div className="flex items-center gap-2">
    <span>{token.tokenSymbol}</span>
    <span>-</span>
    <span>${formatCurrency(token.usdSize)}</span>
    {isLoading ? (
      <Skeleton className="h-4 w-16" />
    ) : priceImpact !== null && priceImpact !== undefined ? (
      <span
        className={priceImpact > 0 ? 'text-destructive' : 'text-primary'}
      >
        ({priceImpact > 0 ? '-' : '+'}
        {Math.abs(priceImpact).toFixed(2)}%)
      </span>
    ) : null}
  </div>
)

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to handle price impact calculations with React Query
 */
const usePriceImpactCalculation = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const chainId = useAtomValue(chainIdAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const rebalanceParams = useRebalanceParams()

  // Debouncing logic
  const [debouncedMetrics, setDebouncedMetrics] = useState(metrics)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Debounce metrics updates
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedMetrics(metrics)
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [metrics])

  // Get all tokens with their sizes
  const stableTokenData = useMemo(
    () => getAllTokensWithSizes(debouncedMetrics, tokenMap),
    [debouncedMetrics, tokenMap]
  )

  // Use React Query for fetching price impacts
  const { data: priceImpacts = {}, isLoading, isFetching } = useQuery({
    queryKey: ['price-impacts', stableTokenData, chainId, rebalanceParams?.prices, ethPrice],
    queryFn: async () => {
      if (!stableTokenData.length || !rebalanceParams || !chainId) {
        return {}
      }

      const wethAddress = WETH_ADDRESSES[chainId]
      if (!wethAddress) return {}

      // Create all fetch promises
      const fetchPromises = stableTokenData.map(async (token) => {
        // Skip API call if target token is WETH (WETH -> WETH)
        if (token.tokenAddress.toLowerCase() === wethAddress.toLowerCase()) {
          return { tokenAddress: token.tokenAddress, priceImpact: 0 }
        }

        // Calculate WETH amount for the swap (all swaps are WETH -> token)
        const wethUnits = convertUsdToTokenUnits(token.usdSize, ethPrice, 18)

        if (wethUnits === '0') {
          return { tokenAddress: token.tokenAddress, priceImpact: null }
        }

        const priceImpact = await fetchPriceImpact(
          wethAddress,
          token.tokenAddress as Address,
          wethUnits,
          chainId
        )

        return { tokenAddress: token.tokenAddress, priceImpact }
      })

      // Execute all fetches in parallel
      const results = await Promise.all(fetchPromises)

      // Convert array to object for easy lookup
      return results.reduce((acc, result) => {
        acc[result.tokenAddress] = result.priceImpact
        return acc
      }, {} as Record<string, number | null>)
    },
    enabled: !!stableTokenData.length && !!rebalanceParams && !!chainId && !!ethPrice,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return {
    tokens: stableTokenData,
    priceImpacts,
    isLoading,
    isFetching,
  }
}

// ==================== MAIN COMPONENT ====================

const RebalancePriceImpact = () => {
  const { tokens, priceImpacts, isLoading, isFetching } = usePriceImpactCalculation()

  if (!tokens.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex items-center gap-2">
        <h4 className="text-primary text-xl">Price Impact</h4>
        {isFetching && !isLoading && (
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        )}
      </div>

      <div className="text-sm space-y-1 pl-2">
        {tokens.map((token) => (
          <TokenImpactRow
            key={token.tokenAddress}
            token={token}
            priceImpact={priceImpacts[token.tokenAddress]}
            isLoading={isLoading || (isFetching && priceImpacts[token.tokenAddress] === undefined)}
          />
        ))}
      </div>
    </div>
  )
}

export default RebalancePriceImpact