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

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 1000

const RebalancePriceImpact = () => {
  // Constants
  const DEFAULT_API_URL = 'https://api.reserve.org/'
  const WETH_ADDRESSES: Record<number, Address> = {
    1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum
    8453: '0x4200000000000000000000000000000000000006', // Base
    42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
  }
  const DUMMY_SIGNER = '0x0000000000000000000000000000000000000001' as Address

  // Hooks for data
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const chainId = useAtomValue(chainIdAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const rebalanceParams = useRebalanceParams()

  // No additional state needed - everything managed by React Query

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

  // Create stable references for token data
  const stableTokenData = useMemo(() => {
    if (!debouncedMetrics) return null

    return {
      surplusTokens: debouncedMetrics.surplusTokens,
      surplusTokenSizes: debouncedMetrics.surplusTokenSizes,
      deficitTokens: debouncedMetrics.deficitTokens,
      deficitTokenSizes: debouncedMetrics.deficitTokenSizes,
    }
  }, [debouncedMetrics])

  // Helper function to convert USD to token units
  const convertUsdToTokenUnits = (
    usdAmount: number,
    tokenAddress: string,
    decimals?: number
  ): string => {
    // For WETH, use hardcoded decimals since it might not be in tokenMap
    const token = tokenMap[tokenAddress]
    const tokenDecimals = decimals ?? token?.decimals

    if (!tokenDecimals) return '0'

    // Get price - for WETH use ethPrice from global atom
    let price = rebalanceParams?.prices[tokenAddress]?.currentPrice

    // If no price and it's WETH, use the ETH price from the global atom
    const wethAddress = WETH_ADDRESSES[chainId]
    if (
      !price &&
      wethAddress &&
      tokenAddress.toLowerCase() === wethAddress.toLowerCase()
    ) {
      price = ethPrice
    }

    if (!price || price === 0) return '0'

    // Calculate token amount: USD / price
    const tokenAmount = usdAmount / price

    // Convert to smallest unit
    try {
      return parseUnits(tokenAmount.toFixed(6), tokenDecimals).toString()
    } catch (error) {
      console.error('Error parsing units:', error, {
        tokenAmount,
        tokenDecimals,
      })
      return '0'
    }
  }

  // Fetch price impact for a single token
  const fetchPriceImpact = async (
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string
  ): Promise<number | null> => {
    try {
      // Build query parameters
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

  // Calculate all price impacts using React Query with parallel fetching
  const { data: priceImpacts = {}, isLoading: loading, isFetching } = useQuery({
    queryKey: ['price-impacts', stableTokenData, chainId, rebalanceParams?.prices],
    queryFn: async () => {
      if (!stableTokenData || !tokenMap || !rebalanceParams || !chainId) {
        return {}
      }

      const wethAddress = WETH_ADDRESSES[chainId]
      if (!wethAddress) {
        return {}
      }

      const results: Record<
        string,
        { usdSize: number; priceImpact: number | null; error?: string }
      > = {}

      // Prepare all fetch promises
      const fetchPromises: Promise<void>[] = []

      // Process surplus tokens (selling for WETH)
      stableTokenData.surplusTokens.forEach((tokenAddress, i) => {
        const tokenAddr = tokenAddress.toLowerCase()
        const usdSize = stableTokenData.surplusTokenSizes[i]

        if (usdSize === 0) return

        const tokenUnits = convertUsdToTokenUnits(usdSize, tokenAddr)
        if (tokenUnits === '0') {
          results[tokenAddr] = {
            usdSize,
            priceImpact: null,
            error: 'No price data',
          }
          return
        }

        // Add to parallel fetch promises
        fetchPromises.push(
          fetchPriceImpact(
            tokenAddr as Address,
            wethAddress,
            tokenUnits
          ).then(priceImpact => {
            results[tokenAddr] = { usdSize, priceImpact }
          }).catch(error => {
            console.error(`Error fetching price impact for ${tokenAddr}:`, error)
            results[tokenAddr] = { usdSize, priceImpact: null, error: 'Failed to fetch' }
          })
        )
      })

      // Process deficit tokens (buying with WETH)
      stableTokenData.deficitTokens.forEach((tokenAddress, i) => {
        const tokenAddr = tokenAddress.toLowerCase()
        const usdSize = stableTokenData.deficitTokenSizes[i]

        if (usdSize === 0) return

        // For deficit tokens, we need to calculate WETH amount needed
        // WETH always has 18 decimals
        const wethUnits = convertUsdToTokenUnits(
          usdSize,
          wethAddress.toLowerCase(),
          18
        )
        if (wethUnits === '0') {
          results[tokenAddr] = {
            usdSize,
            priceImpact: null,
            error: 'Failed to calculate WETH amount',
          }
          return
        }

        // Add to parallel fetch promises
        fetchPromises.push(
          fetchPriceImpact(
            wethAddress,
            tokenAddr as Address,
            wethUnits
          ).then(priceImpact => {
            results[tokenAddr] = { usdSize, priceImpact }
          }).catch(error => {
            console.error(`Error fetching price impact for ${tokenAddr}:`, error)
            results[tokenAddr] = { usdSize, priceImpact: null, error: 'Failed to fetch' }
          })
        )
      })

      // Execute all fetches in parallel
      await Promise.all(fetchPromises)

      return results
    },
    enabled: !!stableTokenData && !!tokenMap && !!rebalanceParams && !!chainId,
    staleTime: 60000, // 1 minute
    refetchInterval: false, // Don't auto-refetch, we control it via debouncing
  })


  if (
    !metrics ||
    (metrics.surplusTokens.length === 0 && metrics.deficitTokens.length === 0)
  ) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <h4 className="text-primary text-xl mb-2">Price Impact</h4>

      {!tokenMap || Object.keys(tokenMap).length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {/* Surplus tokens */}
          {metrics.surplusTokens.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Selling (Surplus):</p>
              <div className="space-y-1 pl-2">
                {metrics.surplusTokens.map((tokenAddress, index) => {
                  const token = tokenMap[tokenAddress.toLowerCase()]
                  const impact = priceImpacts[tokenAddress.toLowerCase()]

                  if (!token) return null
                  
                  // Show token with size from metrics even if impact not loaded yet
                  const usdSize = metrics.surplusTokenSizes[index]
                  if (usdSize === 0) return null

                  return (
                    <div key={tokenAddress} className="flex items-center gap-2">
                      <span>{token.symbol}</span>
                      <span>-</span>
                      <span>${formatCurrency(usdSize)}</span>
                      {(loading || isFetching) && !impact ? (
                        <Skeleton className="h-4 w-16 inline-block" />
                      ) : impact ? (
                        <>
                          {impact.priceImpact !== null && (
                            <span
                              className={
                                impact.priceImpact > 0
                                  ? 'text-destructive'
                                  : 'text-primary'
                              }
                            >
                              ({impact.priceImpact > 0 ? '-' : '+'}
                              {Math.abs(impact.priceImpact).toFixed(2)}%)
                            </span>
                          )}
                          {impact.error && (
                            <span className="text-muted-foreground text-xs">
                              ({impact.error})
                            </span>
                          )}
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Deficit tokens */}
          {metrics.deficitTokens.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Buying (Deficit):</p>
              <div className="space-y-1 pl-2">
                {metrics.deficitTokens.map((tokenAddress, index) => {
                  const token = tokenMap[tokenAddress.toLowerCase()]
                  const impact = priceImpacts[tokenAddress.toLowerCase()]

                  if (!token) return null
                  
                  // Show token with size from metrics even if impact not loaded yet
                  const usdSize = metrics.deficitTokenSizes[index]
                  if (usdSize === 0) return null

                  return (
                    <div key={tokenAddress} className="flex items-center gap-2">
                      <span>{token.symbol}</span>
                      <span>-</span>
                      <span>${formatCurrency(usdSize)}</span>
                      {(loading || isFetching) && !impact ? (
                        <Skeleton className="h-4 w-16 inline-block" />
                      ) : impact ? (
                        <>
                          {impact.priceImpact !== null && (
                            <span
                              className={
                                impact.priceImpact > 0
                                  ? 'text-destructive'
                                  : 'text-primary'
                              }
                            >
                              ({impact.priceImpact > 0 ? '-' : '+'}
                              {Math.abs(impact.priceImpact).toFixed(2)}%)
                            </span>
                          )}
                          {impact.error && (
                            <span className="text-muted-foreground text-xs">
                              ({impact.error})
                            </span>
                          )}
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RebalancePriceImpact
