import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, erc20Abi, parseEventLogs } from 'viem'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { daoCreatedAtom, deployedDTFAtom } from '../../../atoms'
import { useEffect } from 'react'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { indexDeployFormDataAtom } from '../atoms'
import { defaultInputTokenAtom, inputTokenAtom } from './atoms'

const SimpleDeployButton = ({
  data: { approvalNeeded, approvalAddress, tokenIn, amountIn, tx, gas },
}: {
  data: ZapResult
}) => {
  const form = useAtomValue(indexDeployFormDataAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const defaultInputToken = useAtomValue(defaultInputTokenAtom)
  const daoCreated = useAtomValue(daoCreatedAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)

  const usedToken = inputToken || defaultInputToken

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

  const { data: approvalReceipt, error: approvalTxError } =
    useWaitForTransactionReceipt({
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
    label: `Deployed & minted ${form?.symbol || 'DTF'}`,
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
      const event = parseEventLogs({
        abi: dtfIndexDeployerAbi,
        logs: receipt.logs,
        eventName: daoCreated ? 'GovernedFolioDeployed' : 'FolioDeployed',
      })[0]

      // TODO: Handle edge case when event is not found? why would that happen?
      if (event) {
        const { folio } = event.args
        setDeployedDTF(folio)
      }
    }
  }, [receipt])

  return (
    <TransactionButton
      disabled={approvalNeeded ? !approvalReady : !readyToSubmit}
      loading={approving || loadingTx || validatingTx}
      loadingText={
        approving || loadingTx || validatingTx
          ? 'Confirming tx...'
          : 'Pending, sign in wallet'
      }
      gas={readyToSubmit ? (gas ? BigInt(gas) : undefined) : approvalGas}
      onClick={readyToSubmit ? execute : approve}
      text={
        readyToSubmit
          ? `Create ${form?.symbol || 'DTF'}`
          : `Approve use of ${usedToken.symbol || 'ERC20'}`
      }
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

export default SimpleDeployButton
