import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import { useCallback, useMemo } from 'react'
import { Allowance } from 'types'
import { ChainId } from 'utils/chains'
import { Address } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

export const useRevokeUSDT = (
  chainId = ChainId.Mainnet,
  account?: Address,
  allowance?: Omit<Allowance, 'amount'> | undefined
) => {
  const disable = allowance?.symbol !== 'USDT'

  const { data, isLoading: validatingAllowance } = useReadContract(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
          query: { enabled: !disable },
        }
      : undefined
  )

  const canRevoke = account && allowance && !disable ? (data ?? 0n) > 0n : false

  const {
    data: hash,
    writeContract,
    isPending: revoking,
    error: revokeSentError,
  } = useWriteContract()

  const handleRevoke = useCallback(() => {
    if (allowance) {
      writeContract({
        address: allowance.token,
        abi: USDT,
        functionName: 'approve',
        args: [allowance.spender, 0n],
      })
    }
  }, [allowance])

  const {
    data: receipt,
    status: revokeStatus,
    isLoading: validatingRevoke,
    error: revokeError,
  } = useWaitForTransactionReceipt({
    hash: hash,
    query: { enabled: !disable },
  })

  const isLoading = revoking || validatingRevoke
  const isSuccess = revokeStatus === 'success'

  return useMemo(() => {
    if (disable) {
      return {
        validatingAllowance: false,
        hasAllowance: true,
        isLoading: false,
        isSuccess: false,
        revoke: () => {},
        validatingRevoke: false,
        receipt: undefined,
        revokeSentError: undefined,
        revokeError: undefined,
        canRevoke: false,
      }
    }
    return {
      validatingAllowance,
      validatingRevoke,
      isLoading,
      isSuccess,
      revoke: handleRevoke,
      receipt,
      revokeSentError,
      revokeError,
      canRevoke,
    }
  }, [
    disable,
    validatingAllowance,
    validatingRevoke,
    isSuccess,
    isLoading,
    handleRevoke,
    receipt,
    revokeSentError,
    revokeError,
    canRevoke,
  ])
}
