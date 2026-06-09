import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/ui/transaction-button'
import { walletAtom } from '@/state/atoms'
import { useLingui } from '@lingui/react/macro'
import { prepareVoteLockWithdraw } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  closeDrawerAtom,
  stakingInputAtom,
  stTokenAtom,
  unlockBalanceRawAtom,
  unlockDelayAtom,
  updateCurrentDtfStTokenSupplyAtom,
} from '../atoms'
import { getWriteContractParams } from '../utils'

const PROCESSING_DELAY = 10_000

const SubmitUnlockButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(unlockBalanceRawAtom)
  const unlockDelay = useAtomValue(unlockDelayAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setShouldClose = useSetAtom(closeDrawerAtom)
  const updateCurrentDtfStTokenSupply = useSetAtom(
    updateCurrentDtfStTokenSupplyAtom
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const pendingSupplyDelta = useRef(0n)
  const processedReceiptHash = useRef<string>()
  const processingTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current)
    }
  }, [])

  const amountToUnlock = stToken
    ? parseUnits(input || '0', stToken.underlying.decimals)
    : 0n
  const readyToSubmit =
    !!account && !!balance && amountToUnlock > 0n && amountToUnlock <= balance
  const call =
    stToken && account
      ? prepareVoteLockWithdraw({
          chainId: stToken.chainId,
          stToken: stToken.id,
          amount: amountToUnlock,
          account,
        })
      : undefined
  const { data: sharesToBurn } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'previewWithdraw',
    address: stToken?.id,
    args: [amountToUnlock],
    chainId: stToken?.chainId,
    query: { enabled: readyToSubmit && !!stToken?.id },
  })

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

  const write = () => {
    if (!readyToSubmit || !call) return

    pendingSupplyDelta.current = sharesToBurn ? -sharesToBurn : 0n
    writeContract(getWriteContractParams(call))
  }

  useEffect(() => {
    if (receipt?.status !== 'success' || !receipt.transactionHash) return
    if (processedReceiptHash.current === receipt.transactionHash) return

    processedReceiptHash.current = receipt.transactionHash
    if (stToken && pendingSupplyDelta.current !== 0n) {
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
      toast.success(t`Unlock initiated successfully`, { duration: 8000 })
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
      disabled={receipt?.status === 'success' || !readyToSubmit}
      loading={
        isProcessing ||
        (!receipt && (isLoading || !!hash || (hash && !receipt)))
      }
      loadingText={
        isProcessing
          ? t`Processing transaction...`
          : !!hash
            ? t`Confirming tx...`
            : t`Pending, sign in wallet`
      }
      onClick={write}
      text={
        receipt?.status === 'success'
          ? t`Transaction confirmed`
          : unlockDelay
            ? t`Begin ${unlockDelay}-day unlock delay`
            : t`Begin unlock delay`
      }
      className="w-full"
      error={error || txError}
    />
  )
}

export default SubmitUnlockButton
