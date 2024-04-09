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

  const {
    data,
    isLoading: validatingAllowance,
    error: allowanceError,
  } = useContractRead(
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
    error: approvalError,
  } = useContractWrite(config)
  const { status: approvalStatus, isLoading: validatingApproval } =
    useWaitForTransaction({
      hash: writeData?.hash,
      enabled: !disable && !!writeData?.hash,
    })

  const isLoading = approving || validatingApproval
  const isSuccess = approvalStatus === 'success'
  const error = allowanceError || approvalError

  return useMemo(() => {
    if (disable) {
      return {
        validatingAllowance: false,
        hasAllowance: true,
        error: undefined,
        isLoading: false,
        isSuccess: false,
        approve: () => {},
        validatingApproval: false,
      }
    }
    return {
      validatingAllowance,
      validatingApproval,
      hasAllowance: hasAllowance || isSuccess,
      error,
      isLoading,
      isSuccess,
      approve,
    }
  }, [
    disable,
    validatingAllowance,
    validatingApproval,
    hasAllowance,
    isSuccess,
    error,
    isLoading,
    approve,
  ])
}
