import { chainIdAtom, walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { AsyncSwapResponse } from '@/views/index-dtf/issuance/async-swaps/types'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import { Address } from 'viem'
import useDebounce from './useDebounce'

const useAsyncSwap = ({
  dtf,
  amountOut,
  slippage,
  disabled,
  dtfTicker,
  type,
}: {
  dtf?: Address
  amountOut: string
  slippage: number
  disabled: boolean
  dtfTicker: string
  type: 'mint' | 'redeem'
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)

  const endpoint = useDebounce(
    useMemo(
      () =>
        !!dtf && !isNaN(Number(amountOut)) && Number(amountOut) !== 0 && account
          ? `${RESERVE_API}async-swap/quote?dtf=${dtf}&chainId=${chainId}&amountOut=${amountOut}&operation=${type}&signer=${account}`
          : null,
      [chainId, account, dtf, amountOut, type, slippage]
    ),
    500
  )

  return useQuery({
    queryKey: ['async-zap', endpoint],
    queryFn: async (): Promise<AsyncSwapResponse> => {
      if (!endpoint) throw new Error('No endpoint available')
      const response = await fetch(endpoint)
      if (!response.ok) {
        const error = response.status
        mixpanel.track('async-zap', {
          event: 'async-zap',
          wa: account,
          dtf: dtf,
          ticker: dtfTicker,
          chainId,
          type,
          endpoint,
          status: 'error',
          error,
        })
        throw new Error(`Error: ${error}`)
      }
      const data = await response.json()

      if (data) {
        mixpanel.track('async-zap', {
          event: 'async-zap',
          wa: account,
          dtf: dtf,
          ticker: dtfTicker,
          chainId,
          type,
          endpoint,
          status: 'success',
        })
      }

      return data
    },
    enabled: !!endpoint && !disabled,
    refetchInterval: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
  })
}

export default useAsyncSwap
