import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address, erc20Abi, decodeEventLog } from 'viem'
import { useSendTransaction, useWaitForTransaction } from 'wagmi'
import { daoCreatedAtom, deployedDTFAtom } from '../../../atoms'
import { useEffect } from 'react'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import useWatchTransaction from '@/hooks/useWatchTransaction'
import { indexDeployFormDataAtom } from '../atoms'
import { defaultInputTokenAtom, inputTokenAtom, ongoingTxAtom } from './atoms'
import { chainIdAtom } from '@/state/atoms'

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
  const setOngoingTx = useSetAtom(ongoingTxAtom)
  const usedToken = inputToken || defaultInputToken
  const chainId = useAtomValue(chainIdAtom)
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
    query: { enabled: approvalNeeded },
  })

  const {
    data: approvalReceipt,
    isLoading: confirmingApproval,
    error: approvalTxError,
  } = useWaitForTransaction({
    hash: approvalHash,
    chainId,
  })

  const readyToSubmit = !approvalNeeded || approvalReceipt?.status === 'success'

  const {
    data,
    isLoading: loadingTx,
    sendTransaction,
    error: sendError,
    isError: isErrorSend,
  } = useSendTransaction()

  const {
    data: receipt,
    isMining: validatingTx,
    error: txError,
  } = useWatchTransaction({
    hash: data ? (typeof data === 'string' ? data : `0x${data.toString()}`) : undefined,
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
      const event = receipt.logs.map(log => {
        try {
          return decodeEventLog({
            abi: dtfIndexDeployerAbi,
            data: log.data,
            topics: log.topics,
          })
        } catch {
          return null
        }
      }).find(log => log?.eventName === (daoCreated ? 'GovernedFolioDeployed' : 'FolioDeployed'))

      // TODO: Handle edge case when event is not found? why would that happen?
      if (event) {
        const { folio } = event.args
        setDeployedDTF(folio)
      }
    }
  }, [receipt])

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
      onClick={() => {
        setOngoingTx(true)
        readyToSubmit ? execute() : approve()
      }}
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
