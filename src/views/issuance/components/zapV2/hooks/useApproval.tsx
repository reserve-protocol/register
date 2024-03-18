import ERC20 from 'abis/ERC20'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Allowance } from 'types'
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export const useApproval = (allowance?: Allowance | undefined) => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (allowance?.symbol === 'ETH') {
    return {
      validatingAllowance: false,
      hasAllowance: true,
      error: undefined,
      isLoading: false,
      isSuccess: true,
      approve: () => {},
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
      confirmations: 2,
    })

  const isLoading = approving || validatingApproval
  const isSuccess = approvalStatus === 'success'
  const error = allowanceError || approvalError

  return useMemo(() => {
    return {
      validatingAllowance,
      hasAllowance,
      error,
      isLoading,
      isSuccess,
      approve,
    }
  }, [hasAllowance, validatingAllowance, error, isLoading, isSuccess, approve])
}
