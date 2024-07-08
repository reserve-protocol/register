import { erc20ABI } from 'wagmi'
import { useMemo } from 'react'
import { Allowance } from 'types'
import {
  Address,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export const useApproval = (
  chainId: number,
  account?: Address,
  allowance?: Allowance | undefined
) => {
  const disable = allowance?.symbol === 'ETH'

  const { data, isLoading: validatingAllowance } = useContractRead(
    allowance && account
      ? {
          abi: erc20ABI,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
          enabled: !disable,
        }
      : undefined
  )

  const hasAllowance =
    account && allowance && !disable ? (data ?? 0n) >= allowance.amount : false

  const { config } = usePrepareContractWrite(
    allowance && !hasAllowance
      ? {
          address: allowance.token,
          abi: erc20ABI,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
          enabled: !disable,
        }
      : undefined
  )

  const {
    data: writeData,
    write: approve,
    isLoading: approving,
    error: approvalSentError,
  } = useContractWrite(config)

  const {
    data: receipt,
    status: approvalStatus,
    isLoading: validatingApproval,
    error: approvalError,
  } = useWaitForTransaction({
    hash: writeData?.hash,
    enabled: !disable && !!writeData?.hash,
  })

  const isLoading = approving || validatingApproval
  const isSuccess = approvalStatus === 'success'

  return useMemo(() => {
    if (disable) {
      return {
        validatingAllowance: false,
        hasAllowance: true,
        isLoading: false,
        isSuccess: false,
        approve: () => {},
        validatingApproval: false,
        receipt: undefined,
        approvalSentError: undefined,
        approvalError: undefined,
      }
    }
    return {
      validatingAllowance,
      validatingApproval,
      hasAllowance: hasAllowance || isSuccess,
      isLoading,
      isSuccess,
      approve,
      receipt,
      approvalSentError,
      approvalError,
    }
  }, [
    disable,
    validatingAllowance,
    validatingApproval,
    hasAllowance,
    isSuccess,
    isLoading,
    approve,
    receipt,
    approvalError,
    approvalError,
  ])
}
