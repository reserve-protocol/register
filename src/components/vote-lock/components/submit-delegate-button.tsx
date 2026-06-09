import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useLingui } from '@lingui/react/macro'
import {
  prepareVoteLockDelegate,
  prepareVoteLockDelegateOptimistic,
  type ContractCall,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getAddress, isAddress } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  hasVoteLockedBalanceAtom,
  normalDelegateAtom,
  optimisticDelegateAtom,
  stTokenAtom,
  voteLockStateAtom,
} from '../atoms'
import { getWriteContractParams, isSameAddress } from '../utils'

type DelegateCall = {
  label: string
  call: ContractCall
}

const SubmitDelegateButton = ({
  isOptimisticGovernance,
  onSuccess,
}: {
  isOptimisticGovernance: boolean
  onSuccess?: () => void
}) => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const voteLockState = useAtomValue(voteLockStateAtom)
  const hasVoteLockedBalance = useAtomValue(hasVoteLockedBalanceAtom)
  const normalDelegateInput = useAtomValue(normalDelegateAtom)
  const optimisticDelegateInput = useAtomValue(optimisticDelegateAtom)
  const [calls, setCalls] = useState<DelegateCall[]>([])
  const [currentCallIndex, setCurrentCallIndex] = useState(0)
  const processedReceiptHash = useRef<string>()

  const normalDelegate = normalDelegateInput.trim()
  const optimisticDelegate = optimisticDelegateInput.trim()
  const hasOptimisticDelegateInput = !!optimisticDelegate
  const isValidNormalDelegate = isAddress(normalDelegate, { strict: false })
  const isValidOptimisticDelegate =
    !isOptimisticGovernance ||
    !hasOptimisticDelegateInput ||
    isAddress(optimisticDelegate, { strict: false })
  const normalizedNormalDelegate = isValidNormalDelegate
    ? getAddress(normalDelegate)
    : undefined
  const normalizedOptimisticDelegate =
    isValidOptimisticDelegate &&
    isOptimisticGovernance &&
    hasOptimisticDelegateInput
      ? getAddress(optimisticDelegate)
      : undefined
  const hasNormalChange = Boolean(
    normalizedNormalDelegate &&
    !isSameAddress(normalizedNormalDelegate, voteLockState?.delegate)
  )
  const hasOptimisticChange = Boolean(
    isOptimisticGovernance &&
    normalizedOptimisticDelegate &&
    !isSameAddress(
      normalizedOptimisticDelegate,
      voteLockState?.optimisticDelegate
    )
  )
  const disabled =
    !account ||
    !stToken ||
    !hasVoteLockedBalance ||
    !isValidNormalDelegate ||
    !isValidOptimisticDelegate ||
    (!hasNormalChange && !hasOptimisticChange)

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId: stToken?.chainId,
  })
  const currentCall = calls[currentCallIndex]
  const isLoading = isPending || (!!calls.length && (!receipt || !!hash))

  const submitCall = (call: DelegateCall) => {
    try {
      writeContract(getWriteContractParams(call.call))
    } catch {
      setCalls([])
      setCurrentCallIndex(0)
    }
  }

  const write = () => {
    if (disabled || !stToken || !normalizedNormalDelegate) return

    const nextCalls: DelegateCall[] = []

    if (hasNormalChange) {
      nextCalls.push({
        label: t`normal delegate`,
        call: prepareVoteLockDelegate({
          chainId: stToken.chainId,
          stToken: stToken.id,
          delegatee: normalizedNormalDelegate,
        }),
      })
    }

    if (hasOptimisticChange && normalizedOptimisticDelegate) {
      nextCalls.push({
        label: t`fast delegate`,
        call: prepareVoteLockDelegateOptimistic({
          chainId: stToken.chainId,
          stToken: stToken.id,
          delegatee: normalizedOptimisticDelegate,
        }),
      })
    }

    if (!nextCalls.length) return

    processedReceiptHash.current = undefined
    setCalls(nextCalls)
    setCurrentCallIndex(0)
    submitCall(nextCalls[0])
  }

  useEffect(() => {
    if (error || txError || receipt?.status === 'reverted') {
      setCalls([])
      setCurrentCallIndex(0)
      return
    }

    if (receipt?.status !== 'success' || !receipt.transactionHash) return
    if (processedReceiptHash.current === receipt.transactionHash) return

    processedReceiptHash.current = receipt.transactionHash

    const nextIndex = currentCallIndex + 1
    const nextCall = calls[nextIndex]

    if (nextCall) {
      setCurrentCallIndex(nextIndex)
      submitCall(nextCall)
      return
    }

    setCalls([])
    setCurrentCallIndex(0)
    onSuccess?.()
    toast.success(t`Delegation updated`, { duration: 8000 })
  }, [
    receipt?.status,
    receipt?.transactionHash,
    error,
    txError,
    calls,
    currentCallIndex,
    onSuccess,
    t,
  ])

  return (
    <TransactionButton
      chain={stToken?.chainId}
      disabled={disabled}
      loading={isLoading}
      loadingText={
        currentCall
          ? t`Updating ${currentCall.label}...`
          : t`Pending, sign in wallet`
      }
      onClick={write}
      text={t`Update`}
      className="w-full"
      error={error || txError}
    />
  )
}

export default SubmitDelegateButton
