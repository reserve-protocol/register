import { chainIdAtom, walletAtom } from '@/state/atoms'
import zapper, {
  ZapResponse,
} from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import useDebounce from './useDebounce'
import { zapSwapEndpointAtom } from '@/views/index-dtf/overview/components/zap-mint/atom'

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
      const response = await fetch(endpoint!)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!endpoint && !disabled,
    refetchInterval: 12000,
  })
}

export default useZapSwapQuery
