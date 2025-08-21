import { useAtomValue } from 'jotai'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
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

type TokenPriceImpact = {
  tokenAddress: string
  tokenSymbol: string
  usdSize: number
  priceImpact: number | null
  error?: string
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
 * Combine surplus and deficit tokens into a single list
 */
const getAllTokensWithSizes = (
  metrics: any,
  tokenMap: Record<string, any>
): TokenPriceImpact[] => {
  if (!metrics) return []

  const tokens: TokenPriceImpact[] = []

  // Add surplus tokens
  for (let i = 0; i < metrics.surplusTokens.length; i++) {
    const tokenAddress = metrics.surplusTokens[i].toLowerCase()
    const token = tokenMap[tokenAddress]
    if (token && metrics.surplusTokenSizes[i] > 0) {
      tokens.push({
        tokenAddress,
        tokenSymbol: token.symbol,
        usdSize: metrics.surplusTokenSizes[i],
        priceImpact: null,
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
        priceImpact: null,
        type: 'deficit',
      })
    }
  }

  return tokens
}

// ==================== SUB-COMPONENTS ====================

/**
 * Loading skeleton component
 */
const PriceImpactSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
)

/**
 * Individual token impact row
 */
const TokenImpactRow = ({ token }: { token: TokenPriceImpact }) => (
  <div className="flex items-center gap-2">
    <span>{token.tokenSymbol}</span>
    <span>-</span>
    <span>${formatCurrency(token.usdSize)}</span>
    {token.priceImpact !== null && (
      <span
        className={token.priceImpact > 0 ? 'text-destructive' : 'text-primary'}
      >
        ({token.priceImpact > 0 ? '-' : '+'}
        {Math.abs(token.priceImpact).toFixed(2)}%)
      </span>
    )}
    {token.error && (
      <span className="text-muted-foreground text-xs">({token.error})</span>
    )}
  </div>
)

/**
 * List of all tokens with price impacts
 */
const PriceImpactList = ({ tokens }: { tokens: TokenPriceImpact[] }) => (
  <div className="space-y-1 pl-2">
    {tokens.map((token) => (
      <TokenImpactRow key={token.tokenAddress} token={token} />
    ))}
  </div>
)

// ==================== CUSTOM HOOK ====================

/**
 * Custom hook to handle price impact calculations
 */
const usePriceImpactCalculation = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const chainId = useAtomValue(chainIdAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const rebalanceParams = useRebalanceParams()

  const [tokens, setTokens] = useState<TokenPriceImpact[]>([])
  const [loading, setLoading] = useState(false)
  const [hasInitialData, setHasInitialData] = useState(false)

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
  const tokensWithSizes = useMemo(
    () => getAllTokensWithSizes(debouncedMetrics, tokenMap),
    [debouncedMetrics, tokenMap]
  )

  // Calculate all price impacts
  const calculateAllPriceImpacts = useCallback(async () => {
    if (!tokensWithSizes.length || !rebalanceParams || !chainId) return

    const wethAddress = WETH_ADDRESSES[chainId]
    if (!wethAddress) return

    setLoading(true)
    const updatedTokens: TokenPriceImpact[] = []

    for (const token of tokensWithSizes) {
      // Skip API call if target token is WETH (WETH -> WETH)
      if (token.tokenAddress.toLowerCase() === wethAddress.toLowerCase()) {
        updatedTokens.push({
          ...token,
          priceImpact: 0,
        })
        continue
      }

      // Get price for the token
      let price = rebalanceParams.prices[token.tokenAddress]?.currentPrice

      // If no price and it's WETH, use the ETH price from the global atom
      if (
        !price &&
        token.tokenAddress.toLowerCase() === wethAddress.toLowerCase()
      ) {
        price = ethPrice
      }

      // Calculate WETH amount for the swap (all swaps are WETH -> token)
      const wethUnits = convertUsdToTokenUnits(token.usdSize, ethPrice, 18)

      if (wethUnits === '0') {
        updatedTokens.push({
          ...token,
          priceImpact: null,
          error: 'Failed to calculate WETH amount',
        })
        continue
      }

      const priceImpact = await fetchPriceImpact(
        wethAddress,
        token.tokenAddress as Address,
        wethUnits,
        chainId
      )

      updatedTokens.push({
        ...token,
        priceImpact,
      })
    }

    setTokens(updatedTokens)
    setLoading(false)
    setHasInitialData(true)
  }, [tokensWithSizes, rebalanceParams, chainId, ethPrice])

  useEffect(() => {
    calculateAllPriceImpacts()
  }, [calculateAllPriceImpacts])

  return {
    tokens,
    loading,
    hasInitialData,
  }
}

// ==================== MAIN COMPONENT ====================

const RebalancePriceImpact = () => {
  const { tokens, loading, hasInitialData } = usePriceImpactCalculation()

  if (!tokens.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <h4 className="text-primary text-xl mb-2">Price Impact</h4>

      {loading && !hasInitialData ? (
        <PriceImpactSkeleton />
      ) : (
        <div className="text-sm">
          <PriceImpactList tokens={tokens} />
        </div>
      )}
    </div>
  )
}

export default RebalancePriceImpact
