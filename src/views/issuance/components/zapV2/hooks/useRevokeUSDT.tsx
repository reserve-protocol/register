import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import { useMemo } from 'react'
import { Allowance } from 'types'
import { ChainId } from 'utils/chains'
import {
  Address,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export const useRevokeUSDT = (
  chainId = ChainId.Mainnet,
  account?: Address,
  allowance?: Omit<Allowance, 'amount'> | undefined
) => {
  const disable = allowance?.symbol !== 'USDT'

  const { data, isLoading: validatingAllowance } = useContractRead(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
          enabled: !disable,
        }
      : undefined
  )

  const canRevoke = account && allowance && !disable ? (data ?? 0n) > 0n : false

  const { config } = usePrepareContractWrite(
    allowance && canRevoke
      ? {
          address: allowance.token,
          abi: USDT,
          functionName: 'approve',
          args: [allowance.spender, 0n],
          enabled: !disable,
        }
      : undefined
  )

  const {
    data: writeData,
    write: revoke,
    isLoading: revoking,
    error: revokeSentError,
  } = useContractWrite(config)

  const {
    data: receipt,
    status: revokeStatus,
    isLoading: validatingRevoke,
    error: revokeError,
  } = useWaitForTransaction({
    hash: writeData?.hash,
    enabled: !disable && !!writeData?.hash,
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
      revoke,
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
    revoke,
    receipt,
    revokeSentError,
    revokeError,
    canRevoke,
  ])
}
