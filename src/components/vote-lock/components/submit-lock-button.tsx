import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useLingui } from '@lingui/react/macro'
import {
  prepareVoteLockDepositPlan,
  type ContractCall,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { parseUnits, zeroAddress } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  closeDrawerAtom,
  lockCheckboxAtom,
  stakingInputAtom,
  stTokenAtom,
  underlyingBalanceRawAtom,
  updateCurrentDtfStTokenSupplyAtom,
  voteLockStateAtom,
} from '../atoms'
import { getWriteContractParams, isSameAddress } from '../utils'

const PROCESSING_DELAY = 10_000

const SubmitLockButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const voteLockState = useAtomValue(voteLockStateAtom)
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceRawAtom)
  const checkbox = useAtomValue(lockCheckboxAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setShouldClose = useSetAtom(closeDrawerAtom)
  const updateCurrentDtfStTokenSupply = useSetAtom(
    updateCurrentDtfStTokenSupplyAtom
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>()
  const pendingApprovalAmount = useRef(0n)
  const pendingSupplyDelta = useRef(0n)
  const processedApprovalHash = useRef<string>()
  const processedReceiptHash = useRef<string>()
  const processingTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current)
    }
  }, [])

  const amountToLock = stToken
    ? parseUnits(input || '0', stToken.underlying.decimals)
    : 0n
  const allowance = voteLockState?.underlyingAllowance.raw ?? 0n
  const needsApproval = allowance < amountToLock
  const hasBalance = balance !== undefined && balance >= amountToLock
  const currentDelegate = voteLockState?.delegate
  const shouldDelegateToSelf =
    !currentDelegate ||
    currentDelegate === zeroAddress ||
    isSameAddress(currentDelegate, account)
  const plan =
    stToken && (shouldDelegateToSelf || account)
      ? prepareVoteLockDepositPlan({
          chainId: stToken.chainId,
          stToken: stToken.id,
          amount: amountToLock,
          ...(shouldDelegateToSelf
            ? { delegateToSelf: true }
            : { receiver: account! }),
          ...(needsApproval
            ? {
                approval: {
                  underlying: stToken.underlying.address,
                  amount: amountToLock,
                },
              }
            : {}),
        })
      : undefined
  const approvalCall =
    plan?.type === 'approval-required' ? plan.approvals[0] : undefined
  const lockCall = plan?.call
  const { data: sharesToMint } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'previewDeposit',
    address: stToken?.id,
    args: [amountToLock],
    chainId: stToken?.chainId,
    query: { enabled: amountToLock > 0n && stToken?.id !== undefined },
  })

  const {
    writeContract: writeApprove,
    data: approvalHash,
    isPending: approving,
    error: approvalError,
  } = useWriteContract()
  const { data: approvalReceipt, error: approvalTxError } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
      chainId: stToken?.chainId,
    })

  const readyToSubmit =
    !approvalCall ||
    (approvalReceipt?.status === 'success' &&
      approvedAmount !== undefined &&
      approvedAmount >= amountToLock)

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error,
  } = useWriteContract()
  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId: stToken?.chainId,
  })

  const write = (call: ContractCall | undefined) => {
    if (!account || !call) return

    pendingSupplyDelta.current = sharesToMint ?? 0n
    writeContract(getWriteContractParams(call))
  }

  const approve = () => {
    if (!account || !approvalCall) return

    pendingApprovalAmount.current = amountToLock
    writeApprove(getWriteContractParams(approvalCall))
  }

  useEffect(() => {
    if (
      approvalReceipt?.status !== 'success' ||
      !approvalReceipt.transactionHash
    ) {
      return
    }
    if (processedApprovalHash.current === approvalReceipt.transactionHash)
      return

    processedApprovalHash.current = approvalReceipt.transactionHash
    setApprovedAmount(pendingApprovalAmount.current)
    onSuccess?.()
  }, [approvalReceipt?.status, approvalReceipt?.transactionHash, onSuccess])

  useEffect(() => {
    if (receipt?.status !== 'success' || !receipt.transactionHash || !stToken) {
      return
    }
    if (processedReceiptHash.current === receipt.transactionHash) return

    processedReceiptHash.current = receipt.transactionHash
    if (pendingSupplyDelta.current !== 0n) {
      updateCurrentDtfStTokenSupply({
        stToken: stToken.id,
        delta: pendingSupplyDelta.current,
      })
    }
    onSuccess?.()
    setIsProcessing(true)
    processingTimer.current = setTimeout(() => {
      resetInput()
      setShouldClose(true)
      toast.success(t`Vote lock successful`, { duration: 8000 })
      setIsProcessing(false)
      processingTimer.current = undefined
    }, PROCESSING_DELAY)
  }, [
    receipt?.status,
    receipt?.transactionHash,
    resetInput,
    setShouldClose,
    stToken,
    t,
    updateCurrentDtfStTokenSupply,
    onSuccess,
  ])

  if (!stToken) return null

  return (
    <TransactionButton
      chain={stToken.chainId}
      disabled={
        !checkbox ||
        receipt?.status === 'success' ||
        amountToLock === 0n ||
        !hasBalance
      }
      loading={
        isProcessing ||
        (!receipt &&
          (readyToSubmit
            ? isLoading || (hash !== undefined && !receipt)
            : approving ||
              (approvalHash !== undefined && !approvalReceipt)))
      }
      loadingText={
        isProcessing
          ? t`Processing transaction...`
          : hash !== undefined
            ? t`Confirming tx...`
            : t`Pending, sign in wallet`
      }
      onClick={readyToSubmit ? () => write(lockCall) : approve}
      text={
        receipt?.status === 'success'
          ? t`Transaction confirmed`
          : readyToSubmit
            ? t`Vote lock ${stToken.underlying.symbol}`
            : t`Approve use of ${stToken.underlying.symbol}`
      }
      className="w-full"
      error={
        readyToSubmit ? error || txError : approvalError || approvalTxError
      }
    />
  )
}

export default SubmitLockButton
