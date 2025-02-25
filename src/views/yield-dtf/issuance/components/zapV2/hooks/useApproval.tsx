import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import { useCallback, useMemo } from 'react'
import { Allowance } from 'types'
import { ChainId } from 'utils/chains'
import { Address, erc20Abi } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

export const useApproval = (
  chainId: number,
  account?: Address,
  allowance?: Allowance | undefined
) => {
  const disable = allowance?.symbol === 'ETH'
  const isUSDT = allowance?.symbol === 'USDT'

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

  const {
    writeContract,
    data: hash,
    isPending: approving,
    error: approvalSentError,
  } = useWriteContract()

  const handleApprove = useCallback(() => {
    if (allowance) {
      const { token, spender, amount } = allowance

      writeContract({
        address: token,
        abi: isUSDT ? USDT : erc20Abi,
        functionName: 'approve',
        args: [spender, amount],
      })
    }
  }, [allowance])

  const {
    data: receipt,
    status: approvalStatus,
    isLoading: validatingApproval,
    error: approvalError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId,
    query: { enabled: !disable },
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
      approve: handleApprove,
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
    handleApprove,
    receipt,
    approvalSentError,
    approvalError,
    needsRevoke,
  ])
}
