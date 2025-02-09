import TransactionButton, {
  TransactionButtonContainer,
} from '@/components/old/button/TransactionButton'
import { Button } from '@/components/ui/button'
import useContractWrite from '@/hooks/useContractWrite'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useEffect } from 'react'
import { Address, erc20Abi } from 'viem'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'

const LoadingButton = ({
  fetchingZapper,
  insufficientBalance,
  zapperErrorMessage,
  buttonLabel,
}: {
  fetchingZapper: boolean
  insufficientBalance: boolean
  zapperErrorMessage: string
  buttonLabel: string
}) => {
  return (
    <>
      <Button size="lg" className="w-full" disabled>
        {fetchingZapper
          ? 'Loading...'
          : insufficientBalance
            ? 'Insufficient balance'
            : buttonLabel}
      </Button>
      {zapperErrorMessage && (
        <div className="text-red-500 text-sm text-center mt-2">
          {zapperErrorMessage}
        </div>
      )}
    </>
  )
}

const SubmitZapButton = ({
  data: { approvalNeeded, approvalAddress, tokenIn, amountIn, tx, gas },
  chainId,
  buttonLabel,
  inputSymbol,
  outputSymbol,
  onSuccess,
}: {
  data: ZapResult
  chainId: number
  buttonLabel: string
  inputSymbol: string
  outputSymbol: string
  onSuccess?: () => void
}) => {
  const {
    write: approve,
    isReady: approvalReady,
    gas: approvalGas,
    isLoading: approving,
    hash: approvalHash,
    error: approvalError,
    validationError: approvalValidationError,
  } = useContractWrite({
    abi: erc20Abi,
    address: tokenIn,
    functionName: 'approve',
    args: [approvalAddress, BigInt(amountIn)],
    query: { enabled: approvalNeeded },
  })

  const {
    data: approvalReceipt,
    isLoading: confirmingApproval,
    error: approvalTxError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  const readyToSubmit = !approvalNeeded || approvalReceipt?.status === 'success'

  const {
    data,
    isPending: loadingTx,
    sendTransaction,
    error: sendError,
  } = useSendTransaction()

  const {
    data: receipt,
    isMining: validatingTx,
    error: txError,
  } = useWatchTransaction({
    hash: data,
    label: `Swapped ${inputSymbol} for ${outputSymbol}`,
  })

  const execute = () => {
    if (!tx || !readyToSubmit) return

    sendTransaction({
      data: tx.data as Address,
      gas: BigInt(gas ?? 0) || undefined,
      to: tx.to as Address,
      value: BigInt(tx.value),
    })
  }

  useEffect(() => {
    if (receipt) {
      onSuccess?.()
    }
  }, [receipt, onSuccess])

  return (
    <TransactionButton
      chain={chainId}
      disabled={
        approvalNeeded
          ? !approvalReady || confirmingApproval || approving
          : !readyToSubmit || loadingTx || validatingTx
      }
      loading={approving || loadingTx || validatingTx || confirmingApproval}
      loadingText={
        validatingTx || confirmingApproval
          ? 'Confirming tx...'
          : 'Pending, sign in wallet'
      }
      gas={readyToSubmit ? (gas ? BigInt(gas) : undefined) : approvalGas}
      onClick={readyToSubmit ? execute : approve}
      text={readyToSubmit ? buttonLabel : `Approve use of ${inputSymbol}`}
      fullWidth
      error={
        approvalError ||
        approvalValidationError ||
        approvalTxError ||
        sendError ||
        (txError ? Error(txError) : undefined)
      }
    />
  )
}

const SubmitZap = ({
  data,
  chainId,
  buttonLabel,
  inputSymbol,
  outputSymbol,
  showTxButton,
  fetchingZapper,
  insufficientBalance,
  zapperErrorMessage,
  onSuccess,
}: {
  data?: ZapResult
  chainId: number
  buttonLabel: string
  inputSymbol: string
  outputSymbol: string
  showTxButton: boolean
  fetchingZapper: boolean
  insufficientBalance: boolean
  zapperErrorMessage: string
  onSuccess?: () => void
}) => {
  return showTxButton && data ? (
    <SubmitZapButton
      data={data}
      chainId={chainId}
      buttonLabel={buttonLabel}
      inputSymbol={inputSymbol}
      outputSymbol={outputSymbol}
      onSuccess={onSuccess}
    />
  ) : (
    <TransactionButtonContainer chain={chainId}>
      <LoadingButton
        fetchingZapper={fetchingZapper}
        insufficientBalance={insufficientBalance}
        zapperErrorMessage={zapperErrorMessage}
        buttonLabel={buttonLabel}
      />
    </TransactionButtonContainer>
  )
}

export default SubmitZap
