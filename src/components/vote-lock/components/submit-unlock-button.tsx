import TransactionButton from '@/components/ui/transaction-button'
import { getWalletFailure } from '@/components/transaction-error/TransactionError'
import { trackClick } from '@/hooks/useTrackPage'
import { walletAtom } from '@/state/atoms'
import { useLingui } from '@lingui/react/macro'
import { prepareVoteLockRedeem } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BaseError, parseUnits } from 'viem'
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  closeDrawerAtom,
  stakingInputAtom,
  type StTokenExtended,
  unlockDelayAtom,
  unlockShareBalanceRawAtom,
  updateCurrentDtfStTokenSupplyAtom,
} from '../atoms'
import { getWriteContractParams } from '../utils'

const PROCESSING_DELAY = 10_000

const SubmitUnlockButton = ({
  stToken,
  isVaultReady,
  onSuccess,
}: {
  stToken: StTokenExtended
  isVaultReady: boolean
  onSuccess?: () => void
}) => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const { connector } = useAccount()
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(unlockShareBalanceRawAtom)
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

  const sharesToUnlock = parseUnits(input || '0', stToken.token.decimals)
  const readyToSubmit =
    isVaultReady &&
    !!account &&
    !!balance &&
    sharesToUnlock > 0n &&
    sharesToUnlock <= balance
  const call = account
    ? prepareVoteLockRedeem({
        chainId: stToken.chainId,
        stToken: stToken.id,
        shares: sharesToUnlock,
        account,
      })
    : undefined

  const {
    writeContract,
    data: hash,
    isPending: isLoading,
    error,
  } = useWriteContract()
  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId: stToken.chainId,
  })

  const write = () => {
    if (!readyToSubmit || !call) return

    trackClick(
      'vote_lock',
      'vote_lock_unlock_submit',
      stToken.dtfAddress ?? stToken.id,
      stToken.token.symbol,
      stToken.chainId
    )
    pendingSupplyDelta.current = -sharesToUnlock
    writeContract(getWriteContractParams(call), {
      onError: (failure) =>
        mixpanel.track('transaction', {
          product: 'vote_lock_unlock',
          action: 'transaction_failed',
          ca: stToken.dtfAddress ?? stToken.id,
          ticker: stToken.token.symbol,
          chain: stToken.chainId,
          wallet: connector?.name,
          payload: {
            stToken: stToken.id,
            error_name: failure.name,
            error:
              failure instanceof BaseError
                ? failure.shortMessage
                : failure.message,
            wallet_failure: getWalletFailure(failure),
          },
        }),
    })
  }

  useEffect(() => {
    if (receipt?.status !== 'success' || !receipt.transactionHash) return
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
      data-testid="vote-unlock-submit"
    />
  )
}

export default SubmitUnlockButton
