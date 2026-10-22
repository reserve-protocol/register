import TransactionButton from '@/components/ui/transaction-button'
import useContractWrite from '@/hooks/useContractWrite'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, erc20Abi } from 'viem'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { deployedDTFAtom } from '../../../atoms'
import { useEffect, useState } from 'react'
import { readDeployedFolio } from '../../../utils/deployed-folio'
import { INDEX_ZAPPER_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { isSameAddress } from '@/components/vote-lock/utils'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { indexDeployFormDataAtom } from '../atoms'
import { defaultInputTokenAtom, inputTokenAtom, ongoingTxAtom } from './atoms'
import { chainIdAtom } from '@/state/atoms'
import { safeGasLimit } from '@/utils/gas'

const SimpleDeployButton = ({
  data: { approvalNeeded, approvalAddress, tokenIn, amountIn, tx, gas },
}: {
  data: ZapResult
}) => {
  const { t } = useLingui()
  const form = useAtomValue(indexDeployFormDataAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const defaultInputToken = useAtomValue(defaultInputTokenAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)
  const setOngoingTx = useSetAtom(ongoingTxAtom)
  const usedToken = inputToken || defaultInputToken
  const chainId = useAtomValue(chainIdAtom)
  const [receiptError, setReceiptError] = useState<string>()
  // The quote picks the spender and target server-side; only the known ZapperDeployer may receive funds.
  const zapperDeployer = INDEX_ZAPPER_DEPLOYER_ADDRESS[chainId]
  const untrustedRoute =
    !isSameAddress(tx?.to, zapperDeployer) ||
    (approvalNeeded && !isSameAddress(approvalAddress, zapperDeployer))
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
    args: [approvalAddress, BigInt(amountIn)],
    query: { enabled: approvalNeeded && !untrustedRoute },
  })

  const {
    data: approvalReceipt,
    isLoading: confirmingApproval,
    error: approvalTxError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
    chainId,
  })

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
    label: t`Deployed & minted ${form?.symbol || 'DTF'}`,
  })

  const execute = () => {
    if (!tx || !readyToSubmit || untrustedRoute) return

    sendTransaction({
      data: tx.data as Address,
      gas: safeGasLimit(BigInt(gas ?? 0) || undefined),
      to: tx.to as Address,
      value: BigInt(tx.value),
    })
  }

  useEffect(() => {
    if (receipt?.status !== 'success') return
    const { folio, error } = readDeployedFolio(receipt.logs, chainId)
    if (folio) setDeployedDTF(folio)
    else setReceiptError(error)
  }, [receipt, chainId, setDeployedDTF])

  useEffect(() => {
    if (untrustedRoute)
      console.error('[deploy] zap quote targets an unknown contract', {
        to: tx?.to,
        approvalAddress,
        expected: zapperDeployer,
      })
  }, [untrustedRoute, tx?.to, approvalAddress, zapperDeployer])

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
    <TransactionButton
      data-testid="deploy-zap-submit"
      disabled={
        untrustedRoute || approvalNeeded
          ? !approvalReady || confirmingApproval || approving
          : !readyToSubmit || loadingTx || validatingTx
      }
      loading={approving || loadingTx || validatingTx || confirmingApproval}
      loadingText={
        validatingTx || confirmingApproval
          ? t`Confirming tx...`
          : t`Pending, sign in wallet`
      }
      gas={readyToSubmit ? (gas ? BigInt(gas) : undefined) : approvalGas}
      onClick={() => {
        setOngoingTx(true)
        if (readyToSubmit) execute()
        else approve()
      }}
      text={
        readyToSubmit
          ? t`Create ${form?.symbol || 'DTF'}`
          : t`Approve use of ${usedToken.symbol || 'ERC20'}`
      }
      className="w-full"
      error={
        (untrustedRoute
          ? Error(
              t`The quote targets an unknown contract. Refresh the quote or use the manual deploy.`
            )
          : undefined) ||
        (receipt?.status === 'reverted'
          ? Error(t`Transaction reverted`)
          : undefined) ||
        (receiptError
          ? Error(
              t`The DTF was deployed but its address couldn't be read from the transaction. Check the transaction on the explorer.`
            )
          : undefined) ||
        approvalError ||
        approvalValidationError ||
        approvalTxError ||
        sendError ||
        (txError ? Error(txError) : undefined)
      }
    />
  )
}

export default SimpleDeployButton
