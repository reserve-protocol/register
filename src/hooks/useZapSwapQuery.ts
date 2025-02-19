import { chainIdAtom, walletAtom } from '@/state/atoms'
import { zapSwapEndpointAtom } from '@/views/index-dtf/overview/components/zap-mint/atom'
import zapper, {
  ZapResponse,
} from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import useDebounce from './useDebounce'

const useZapSwapQuery = ({
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  disabled,
  forceMint,
}: {
  tokenIn?: Address
  tokenOut?: Address
  amountIn: string
  slippage: number
  disabled: boolean
  forceMint: boolean
}) => {
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
      // If dust > 1% of amountOutValue, retry up to 3 times.
      const maxDustRetries = 3
      let dustAttempt = 0
      let lastData: ZapResponse

      while (true) {
        const response = await fetch(endpoint!)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
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
          if (dust > 0.01 * amountOut && dustAttempt < maxDustRetries) {
            dustAttempt++
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
