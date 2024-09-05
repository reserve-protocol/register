import { useMemo } from 'react'
import { Allowance } from 'types'
import {
  Address,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { ChainId } from 'utils/chains'
import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'

export const useApproval = (
  chainId: number,
  account?: Address,
  allowance?: Allowance | undefined
) => {
  const disable = allowance?.symbol === 'ETH'
  const isUSDT = allowance?.symbol === 'USDT'

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

  const hasAllowance =
    account && allowance && !disable ? (data ?? 0n) >= allowance.amount : false

  // Only for USDT on mainnet
  const needsRevoke = Boolean(
    !hasAllowance &&
      data &&
      allowance &&
      data > 0n &&
      chainId === ChainId.Mainnet &&
      allowance.symbol === 'USDT'
  )

  const { config: configERC20 } = usePrepareContractWrite(
    allowance && !hasAllowance && !isUSDT
      ? {
          address: allowance.token,
          abi: ERC20,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
          enabled: !disable,
        }
      : undefined
  )

  const { config: configUSDT } = usePrepareContractWrite(
    allowance && !hasAllowance && isUSDT
      ? {
          address: allowance.token,
          abi: USDT,
          functionName: 'approve',
          args: [allowance.spender, allowance.amount],
          enabled: !disable,
        }
      : undefined
  )

  const config = (isUSDT ? configUSDT : configERC20) as any

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
        needsRevoke: false,
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
      needsRevoke,
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
    approvalSentError,
    approvalError,
    needsRevoke,
  ])
}
