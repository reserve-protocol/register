import ERC20 from 'abis/ERC20'
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
  if (allowance?.symbol === 'ETH') {
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

  const {
    data,
    isLoading: validatingAllowance,
    error: allowanceError,
  } = useContractRead(
    allowance && account
      ? {
          abi: ERC20,
          functionName: 'allowance',
          address: allowance.token,
          args: [account, allowance.spender],
          chainId,
        }
      : undefined
  )

  const hasAllowance =
    account && allowance ? (data ?? 0n) >= allowance.amount : false

  const { config } = usePrepareContractWrite(
    allowance && !hasAllowance
      ? {
          address: allowance.token,
          abi: ERC20,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
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
    })

  const isLoading = approving || validatingApproval
  const isSuccess = approvalStatus === 'success'
  const error = allowanceError || approvalError

  return useMemo(() => {
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
    validatingAllowance,
    validatingApproval,
    hasAllowance,
    error,
    isLoading,
    isSuccess,
    approve,
  ])
}
