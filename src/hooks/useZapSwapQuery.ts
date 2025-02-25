import { chainIdAtom, walletAtom } from '@/state/atoms'
import { zapSwapEndpointAtom } from '@/views/index-dtf/overview/components/zap-mint/atom'
import zapper, {
  ZapResponse,
} from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import useDebounce from './useDebounce'

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
      const maxDustRetries = 1
      // If price impact > 2%, retry 3 times.
      const maxPriceImpactRetries = 1
      let dustAttempt = 0
      let priceImpactAttempt = 0
      let lastData: ZapResponse

      while (true) {
        // Bypass cache if price impact > threshold
        const currentEndpoint =
          priceImpactAttempt > 0 ? getEndpoint(true) : endpoint

        if (!currentEndpoint) throw new Error('No endpoint available')

        const response = await fetch(currentEndpoint)
        if (!response.ok) {
          const error = response.status
          mixpanel.track('index-dtf-zap-swap', {
            event: 'index-dtf-zap-swap',
            wa: account,
            ca: tokenIn,
            ticker: dtfTicker,
            chainId,
            type,
            endpoint: currentEndpoint,
            status: 'error',
            tokenIn,
            tokenOut,
            error,
          })
          throw new Error(`Error: ${error}`)
        }
        const data = await response.json()

        if (data) {
          mixpanel.track('index-dtf-zap-swap', {
            event: 'index-dtf-zap-swap',
            wa: account,
            ca: tokenIn,
            ticker: dtfTicker,
            chainId,
            type,
            endpoint: currentEndpoint,
            status: data.status,
            tokenIn,
            tokenOut,
            amountInValue: data.result?.amountInValue,
            amountOutValue: data.result?.amountOutValue,
            dustValue: data.result?.dustValue,
            truePriceImpact: data.result?.truePriceImpact,
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
            dust > DUST_REFRESH_THRESHOLD * amountOut &&
            dustAttempt < maxDustRetries

          if (dustAttempt < maxDustRetries && isDustRetry) {
            dustAttempt++
            continue
          }

          const isPriceImpactRetry =
            priceImpact > PRICE_IMPACT_THRESHOLD &&
            priceImpactAttempt < maxPriceImpactRetries
          console.log('isPriceImpactRetry', isPriceImpactRetry)
          if (
            priceImpactAttempt < maxPriceImpactRetries &&
            isPriceImpactRetry
          ) {
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
