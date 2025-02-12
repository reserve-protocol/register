import { chainIdAtom, walletAtom } from '@/state/atoms'
import zapper, {
  ZapResponse,
} from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'
import useDebounce from './useDebounce'

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const useZapSwapQuery = ({
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  disabled,
}: {
  tokenIn?: Address
  tokenOut?: Address
  amountIn: string
  slippage: number
  disabled: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)

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
        tokenIn: tokenIn === ETH_ADDRESS ? zeroAddress : tokenIn,
        tokenOut,
        amountIn,
        slippage,
        signer: account as Address,
      })
    }, [chainId, account, tokenIn, tokenOut, amountIn, slippage]),
    500
  )

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
