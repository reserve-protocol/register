import TransactionButton, {
  TransactionButtonContainer,
} from '@/components/old/button/TransactionButton'
import FusionTokenLogo from '@/components/token-logo/fusion-token-logo'
import { Button } from '@/components/ui/button'
import useContractWrite from '@/hooks/useContractWrite'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { ROUTES } from '@/utils/constants'
import {
  useTrackIndexDTFZap,
  useTrackIndexDTFZapClick,
} from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Address, erc20Abi } from 'viem'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import {
  currentZapMintTabAtom,
  zapHighPriceImpactAtom,
  zapOngoingTxAtom,
  zapPriceImpactWarningCheckboxAtom,
} from './atom'
import ZapErrorMsg, { ZapTxErrorMsg } from './zap-error-msg'
import ZapPriceImpactWarningCheckbox from './zap-warning-checkbox'

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
      <Button size="lg" className="w-full rounded-xl" disabled>
        {fetchingZapper
          ? 'Loading...'
          : insufficientBalance
            ? 'Insufficient balance'
            : buttonLabel}
      </Button>
      <ZapErrorMsg error={zapperErrorMessage} />
    </>
  )
}

const SubmitZapButton = ({
  data: {
    tokenIn,
    tokenOut,
    approvalNeeded,
    approvalAddress,
    amountIn,
    tx,
    gas,
    truePriceImpact,
  },
  chainId,
  buttonLabel,
  inputSymbol,
  outputSymbol,
  inputAmount,
  outputAmount,
  onSuccess,
}: {
  data: ZapResult
  chainId: number
  buttonLabel: string
  inputSymbol: string
  outputSymbol: string
  inputAmount: string
  outputAmount: string
  onSuccess?: () => void
}) => {
  const warningAccepted = useAtomValue(zapPriceImpactWarningCheckboxAtom)
  const highPriceImpact = useAtomValue(zapHighPriceImpactAtom)
  const { pathname } = useLocation()
  const subpage = pathname.includes(ROUTES.ISSUANCE) ? 'mint' : 'overview'

  const { trackClick } = useTrackIndexDTFZapClick('overview', subpage)
  const { track } = useTrackIndexDTFZap('alert', 'overview', subpage)

  const setOngoingTx = useSetAtom(zapOngoingTxAtom)
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const {
    write: approve,
    isReady: approvalReady,
    gas: approvalGas,
    isLoading: approving,
    hash: approvalHash,
    error: approvalError,
    validationError: approvalValidationError,
    isError: isErrorApproval,
  } = useContractWrite({
    abi: erc20Abi,
    address: tokenIn,
    functionName: 'approve',
    args: [approvalAddress, (BigInt(amountIn) * 120n) / 100n],
    query: { enabled: approvalNeeded },
    chainId,
  })

  const {
    data: approvalReceipt,
    isLoading: confirmingApproval,
    error: approvalTxError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
    chainId,
  })

  const addStepOneLabel =
    approvalNeeded && approvalReceipt?.status !== 'success'
  const addStepTwoLabel = approvalReceipt?.status === 'success'
  const readyToSubmit = !approvalNeeded || approvalReceipt?.status === 'success'

  const {
    data,
    isPending: loadingTx,
    sendTransaction,
    error: sendError,
    isError: isErrorSend,
  } = useSendTransaction()

  const {
    data: receipt,
    isMining: validatingTx,
    error: txError,
  } = useWatchTransaction({
    hash: data,
    label: `Swapped ${inputSymbol} for ${outputSymbol}`,
    successMessage: {
      title: `Swapped`,
      subtitle: `${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`,
      type: 'success',
      icon: (
        <FusionTokenLogo
          left={{ symbol: inputSymbol, chainId, address: tokenIn }}
          right={{ symbol: outputSymbol, chainId, address: tokenOut }}
        />
      ),
    },
  })

  const execute = () => {
    if (!tx || !readyToSubmit) return

    sendTransaction({
      data: tx.data as Address,
      gas: BigInt(gas ?? 0) || undefined,
      to: tx.to as Address,
      value: BigInt(tx.value),
      chainId,
    })
  }

  const error =
    approvalError ||
    approvalValidationError ||
    approvalTxError ||
    sendError ||
    (txError ? Error(txError) : undefined)

  useEffect(() => {
    if (receipt?.status === 'success') {
      track('zap_success_notification', inputSymbol, outputSymbol)
      onSuccess?.()
    }
  }, [receipt?.status])

  useEffect(() => {
    if (
      approvalReceipt ||
      approvalTxError ||
      receipt ||
      txError ||
      isErrorApproval ||
      isErrorSend
    ) {
      setOngoingTx(false)
    }
  }, [
    receipt,
    approvalReceipt,
    approvalTxError,
    txError,
    isErrorApproval,
    isErrorSend,
  ])

  return (
    <div className="flex flex-col gap-1">
      <ZapPriceImpactWarningCheckbox priceImpact={truePriceImpact} />
      <TransactionButton
        chain={chainId}
        disabled={
          (highPriceImpact && !warningAccepted) ||
          (approvalNeeded
            ? !approvalReady || confirmingApproval || approving
            : !readyToSubmit || loadingTx || validatingTx)
        }
        loading={approving || loadingTx || validatingTx || confirmingApproval}
        loadingText={
          validatingTx || confirmingApproval
            ? 'Confirming tx...'
            : 'Pending, sign in wallet'
        }
        // gas={readyToSubmit ? (gas ? BigInt(gas) : undefined) : approvalGas}
        onClick={() => {
          setOngoingTx(true)
          if (readyToSubmit) {
            trackClick(`zap_${currentTab}`, inputSymbol, outputSymbol)
            execute()
          } else {
            trackClick('zap-approve', inputSymbol, outputSymbol)
            approve()
          }
        }}
        text={
          readyToSubmit
            ? `${addStepTwoLabel ? 'Step 2. ' : ''}${buttonLabel}`
            : `${addStepOneLabel ? 'Step 1. ' : ''}Approve use of ${inputSymbol}`
        }
        fullWidth
        sx={{
          borderRadius: '12px',
        }}
      />
      <ZapTxErrorMsg error={error} />
    </div>
  )
}

const SubmitZap = ({
  data,
  chainId,
  buttonLabel,
  inputSymbol,
  outputSymbol,
  inputAmount,
  outputAmount,
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
  inputAmount: string
  outputAmount: string
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
      inputAmount={inputAmount}
      outputAmount={outputAmount}
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
