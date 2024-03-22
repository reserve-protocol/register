import ERC20 from 'abis/ERC20'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Allowance } from 'types'
import {
  UsePrepareContractWriteConfig,
  useContractRead,
  useWaitForTransaction,
} from 'wagmi'
import useContractWrite from './useContractWrite'
import useWatchTransaction from './useWatchTransaction'

export const useApproval = (allowance: Allowance | undefined) => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

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

  const {
    write: approve,
    isReady,
    isLoading: approving,
    hash,
    error: approvalError,
    validationError: approvalValidationError,
  } = useContractWrite(
    allowance && !hasAllowance
      ? {
          address: allowance.token,
          abi: ERC20,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
        }
      : undefined
  )
  const { status: approvalStatus, isLoading: validatingApproval } =
    useWaitForTransaction({
      hash,
      confirmations: 2,
    })

  const isLoading = approving || validatingApproval
  const isSuccess = approvalStatus === 'success'
  const error = allowanceError || approvalError || approvalValidationError

  return useMemo(() => {
    return {
      validatingAllowance,
      hasAllowance,
      error,
      isReady,
      isLoading,
      isSuccess,
      hash,
      approve,
    }
  }, [
    hasAllowance,
    validatingAllowance,
    error,
    isLoading,
    isSuccess,
    isReady,
    hash,
    approve,
  ])
}

const useApproveAndExecute = (
  call: UsePrepareContractWriteConfig | undefined,
  allowance: Allowance | undefined,
  label: string
) => {
  const {
    validatingAllowance,
    hasAllowance,
    error,
    isReady: approvalReady,
    isLoading: approvalLoading,
    isSuccess,
    hash: approvalHash,
    approve,
  } = useApproval(allowance)

  const {
    write,
    isReady: executeReady,
    error: executeError,
    validationError,
    isLoading: executing,
    hash: executeHash,
  } = useContractWrite(call && (hasAllowance || isSuccess) ? call : undefined)

  const { status, isMining } = useWatchTransaction({
    hash: executeHash,
    label,
  })

  const processError = error || validationError || executeError
  const isLoading =
    approvalLoading || executing || isMining || (isSuccess && !processError)
  const isReady = approvalReady || executeReady
  const isConfirmed = status === 'success'

  const execute = useCallback((): void => {
    if (!hasAllowance && !isSuccess) {
      approve?.()
    } else {
      write?.()
    }
  }, [hasAllowance, isSuccess, approve, write])

  // Trigger next transaction after approval
  useEffect(() => {
    if (!hasAllowance && isSuccess && executeReady) {
      write?.()
    }
  }, [hasAllowance, isSuccess, executeReady])

  return useMemo(() => {
    let errorText = null

    if (processError) {
      errorText = processError ? 'Execution failed' : null

      if (processError?.message.includes('User rejected the request')) {
        errorText = 'Transaction rejected'
      }

      console.error('[TRANSACTION_ERROR]', processError)
    }

    return {
      execute,
      isReady,
      isLoading,
      executeHash,
      approvalHash,
      hasAllowance,
      isApproved: isSuccess,
      isConfirmed,
      error: errorText,
      validatingAllowance,
    }
  }, [
    execute,
    processError,
    isLoading,
    isReady,
    executeHash,
    approvalHash,
    hasAllowance,
    isSuccess,
    validatingAllowance,
    isConfirmed,
  ])
}

export default useApproveAndExecute
