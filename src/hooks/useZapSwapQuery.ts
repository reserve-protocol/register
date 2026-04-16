import { chainIdAtom, walletAtom } from '@/state/atoms'
import { zapSwapEndpointAtom } from '@/views/index-dtf/overview/components/zap-mint/atom'
import zapper, { ZapResponse } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import useDebounce from './useDebounce'
import { fetchBestZapQuote } from './zap-quote-providers'

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
  }, [endpoint, setZapSwapEndpoint])

  return useQuery({
    queryKey: ['zapDeploy', endpoint],
    queryFn: async (): Promise<ZapResponse> => {
      const maxDustRetries = 0
      const maxPriceImpactRetries = 0
      let dustAttempt = 0
      let priceImpactAttempt = 0
      let lastData: ZapResponse

      while (true) {
        if (!endpoint) throw new Error('No endpoint available')
        if (!account || !tokenIn || !tokenOut) {
          throw new Error('Missing quote parameters')
        }

        const { selected, successfulQuotes, comparedProviders } =
          await fetchBestZapQuote({
            reserveEndpoint: endpoint,
            chainId,
            signer: account as Address,
            tokenIn,
            tokenOut,
            amountIn,
          })

        const data = selected.response

        mixpanel.track('index-dtf-zap-swap', {
          event: 'index-dtf-zap-swap',
          wa: account,
          ca: tokenIn,
          ticker: dtfTicker,
          chainId,
          type,
          endpoint,
          status: data.status,
          tokenIn,
          tokenOut,
          selectedProvider: selected.provider,
          comparedProviders,
          successfulProviders: successfulQuotes.length,
          amountInValue: data.result?.amountInValue,
          amountOutValue: data.result?.amountOutValue,
          dustValue: data.result?.dustValue,
          truePriceImpact: data.result?.truePriceImpact,
        })

        if (data.status === 'error') {
          throw new Error(data.error)
        }

        lastData = data

        if (data.result) {
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
