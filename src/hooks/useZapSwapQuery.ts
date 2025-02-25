import { chainIdAtom, walletAtom } from '@/state/atoms'
import { zapSwapEndpointAtom } from '@/views/index-dtf/overview/components/zap-mint/atom'
import zapper, {
  ZapResponse,
} from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, formatEther } from 'viem'
import useDebounce from './useDebounce'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'

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
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const setZapSwapEndpoint = useSetAtom(zapSwapEndpointAtom)

  const endpoint = useDebounce(
    useMemo(() => {
      if (
        !tokenIn ||
        !tokenOut ||
        isNaN(Number(amountIn)) ||
        Number(amountIn) === 0
      )
        return null
      return zapper.zap({
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        signer: account as Address,
        trade: !forceMint,
      })
    }, [chainId, account, tokenIn, tokenOut, amountIn, slippage, forceMint]),
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
      const maxPriceImpactRetries = 3
      let dustAttempt = 0
      let priceImpactAttempt = 0
      let lastData: ZapResponse

      while (true) {
        const response = await fetch(endpoint!)
        if (!response.ok) {
          const error = response.status
          mixpanel.track('index-dtf-zap-swap', {
            event: 'index-dtf-zap-swap',
            wa: account,
            ca: tokenIn,
            ticker: dtfTicker,
            chainId,
            type,
            endpoint: endpoint,
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
            endpoint: endpoint,
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

        if (
          data &&
          data.result &&
          data.result.amountOutValue &&
          data.result.dustValue
        ) {
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

      if (
        indexDTFPrice &&
        lastData?.result &&
        [
          '0xf91384484f4717314798e8975bcd904a35fc2bf1',
          '0x4e3b170dcbe704b248df5f56d488114ace01b1c5',
        ].includes(tokenOut?.toLowerCase() || '')
      ) {
        const amountOutValue =
          indexDTFPrice * Number(formatEther(BigInt(lastData.result.amountOut)))
        const amountInValue = Number(lastData.result.amountInValue)
        const dustValue = Number(lastData.result.dustValue) // TODO: calculate from dust

        const diff = Math.abs(amountOutValue + dustValue - amountInValue)
        const truePriceImpact =
          amountOutValue + dustValue > amountInValue
            ? -(diff / amountInValue) * 100
            : (diff / amountInValue) * 100

        const priceImpact = truePriceImpact < 0 ? 0 : truePriceImpact

        lastData = {
          ...lastData,
          result: {
            ...lastData.result,
            amountOutValue,
            truePriceImpact,
            priceImpact,
          },
        }
      }

      if (
        indexDTFPrice &&
        lastData?.result &&
        [
          '0xf91384484f4717314798e8975bcd904a35fc2bf1',
          '0x4e3b170dcbe704b248df5f56d488114ace01b1c5',
        ].includes(tokenIn?.toLowerCase() || '')
      ) {
        const amountOutValue = Number(lastData.result.amountOutValue)
        const amountInValue =
          indexDTFPrice * Number(formatEther(BigInt(lastData.result.amountIn)))
        const dustValue = Number(lastData.result.dustValue) // TODO: calculate from dust

        const diff = Math.abs(amountOutValue + dustValue - amountInValue)
        const truePriceImpact =
          amountOutValue + dustValue > amountInValue
            ? -(diff / amountInValue) * 100
            : (diff / amountInValue) * 100

        const priceImpact = truePriceImpact < 0 ? 0 : truePriceImpact

        lastData = {
          ...lastData,
          result: {
            ...lastData.result,
            amountOutValue,
            truePriceImpact,
            priceImpact,
          },
        }
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
