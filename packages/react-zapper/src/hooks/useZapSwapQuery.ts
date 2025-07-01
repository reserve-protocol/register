import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { chainIdAtom, walletAtom, indexDTFAtom } from '../state/atoms'
import zapper, { ZapResponse } from '../types/api'
import { zapSwapEndpointAtom } from '../components/zap-mint/atom'
import useDebounce from './useDebounce'
import { trackApiError, trackQuoteRefresh } from '../utils/tracking'

const DUST_REFRESH_THRESHOLD = 0.025
const PRICE_IMPACT_THRESHOLD = 2

const useZapSwapQuery = ({
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  disabled,
  forceMint,
  dtfTicker,
  type,
}: {
  tokenIn?: Address
  tokenOut?: Address
  amountIn: string
  slippage: number
  disabled: boolean
  forceMint: boolean
  dtfTicker: string
  type: 'buy' | 'sell'
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const setZapSwapEndpoint = useSetAtom(zapSwapEndpointAtom)

  const getEndpoint = (bypassCache = false) =>
    !tokenIn || !tokenOut || isNaN(Number(amountIn)) || Number(amountIn) === 0
      ? null
      : zapper.zap({
          chainId,
          tokenIn,
          tokenOut,
          amountIn,
          slippage,
          signer: account as Address,
          trade: !forceMint,
          bypassCache,
        })

  const endpoint = useDebounce(
    useMemo(
      () => getEndpoint(false),
      [chainId, account, tokenIn, tokenOut, amountIn, slippage, forceMint]
    ),
    500
  )

  useEffect(() => {
    setZapSwapEndpoint(endpoint ?? '')
  }, [endpoint])

  return useQuery({
    queryKey: ['zapDeploy', endpoint],
    queryFn: async (): Promise<ZapResponse> => {
      // If dust > 2.5% of amountOutValue, retry once.
      const maxDustRetries = 0
      // If price impact > 2%, retry 3 times.
      const maxPriceImpactRetries = 0
      let dustAttempt = 0
      let priceImpactAttempt = 0
      let lastData: ZapResponse

      while (true) {
        // Bypass cache if price impact > threshold
        const currentEndpoint = endpoint

        if (!currentEndpoint) throw new Error('No endpoint available')

        const response = await fetch(currentEndpoint)
        if (!response.ok) {
          const error = response.status
          // Track API error
          trackApiError(currentEndpoint, `HTTP ${error}`, indexDTF?.token.symbol, indexDTF?.id, chainId)
          throw new Error(`Error: ${error}`)
        }
        const data = await response.json()

        if (data) {
          // Track successful quote fetch
          trackQuoteRefresh('auto', indexDTF?.token.symbol, indexDTF?.id, chainId, {
            amount: amountIn,
            tab: type,
            quote: data.result?.amountOutValue || 'unknown',
          })
        }

        if (data && data.status === 'error') {
          throw new Error(data.error)
        }

        lastData = data

        if (data && data.result) {
          const amountOut = Number(data.result.amountOutValue)
          const dust = Number(data.result.dustValue)
          const priceImpact = Number(data.result.truePriceImpact)
          const isDustRetry =
            dustAttempt < maxDustRetries &&
            dust > DUST_REFRESH_THRESHOLD * amountOut

          if (isDustRetry) {
            dustAttempt++
            continue
          }

          const isPriceImpactRetry =
            priceImpactAttempt < maxPriceImpactRetries &&
            priceImpact > PRICE_IMPACT_THRESHOLD

          if (isPriceImpactRetry) {
            priceImpactAttempt++
            continue
          }
        }
        break
      }

      return lastData
    },
    enabled: !!endpoint && !disabled,
    refetchInterval: 12000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
  })
}

export default useZapSwapQuery