import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ZapErrorType } from '../ZapError'
import { useZap } from './ZapContext'
import { Allowance } from 'types'
import { Address, TransactionReceipt, parseUnits } from 'viem'
import { useApproval } from '../hooks/useApproval'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import mixpanel from 'mixpanel-browser'
import useWatchTransaction from 'hooks/useWatchTransaction'

type ZapTxContextType = {
  error?: ZapErrorType

  hasAllowance: boolean
  loadingApproval: boolean
  validatingApproval: boolean
  approvalSuccess: boolean
  approve?: () => void

  loadingTx: boolean
  validatingTx: boolean
  sendTransaction?: () => void
  receipt?: TransactionReceipt
  onGoingConfirmation: boolean
}

const ZapTxContext = createContext<ZapTxContextType>({
  hasAllowance: false,
  loadingApproval: false,
  validatingApproval: false,
  approvalSuccess: false,
  loadingTx: false,
  validatingTx: false,
  onGoingConfirmation: false,
})

export const useZapTx = () => {
  return useContext(ZapTxContext)
}

export const ZapTxProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [error, setError] = useState<ZapErrorType>()
  const {
    chainId,
    account,
    tokenIn,
    tokenOut,
    spender,
    amountIn,
    zapResult,
    endpoint,
    operation,
    setOpenSubmitModal,
    resetZap,
  } = useZap()

  // Approval
  const allowance: Allowance | undefined = useMemo(() => {
    if (!tokenIn.address || !spender) return undefined
    return {
      token: tokenIn.address.toString() as Address,
      spender: spender as Address,
      amount: parseUnits(amountIn, tokenIn.decimals),
      symbol: tokenIn.symbol,
      decimals: tokenIn.decimals,
    }
  }, [tokenIn, spender, amountIn])

  const {
    hasAllowance,
    error: allowanceError,
    isLoading: loadingApproval,
    validatingApproval,
    isSuccess: approvalSuccess,
    approve,
  } = useApproval(chainId, account, allowance)

  useEffect(() => {
    if (approvalSuccess) {
      mixpanel.track('Zap approval success', {
        Operation: operation,
        Endpoint: endpoint,
      })
    }
  }, [approvalSuccess, operation, endpoint])

  useEffect(() => {
    if (
      allowanceError &&
      !(loadingApproval || validatingApproval || approvalSuccess)
    ) {
      setError({
        title: 'Transaction rejected: Approval failed',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
    } else {
      setError(undefined)
    }
  }, [allowanceError, approvalSuccess, loadingApproval, validatingApproval])

  // Transaction
  const { config } = usePrepareSendTransaction(
    zapResult && zapResult.tx && (hasAllowance || approvalSuccess)
      ? {
          data: zapResult.tx.data as Address,
          gas: BigInt(zapResult.gas ?? 0) || undefined,
          to: zapResult.tx.to as Address,
          value: BigInt(zapResult.tx.value),
        }
      : undefined
  )

  const {
    data,
    isLoading: loadingTx,
    isIdle: isIdleTx,
    sendTransaction,
    error: sendError,
  } = useSendTransaction(config)

  const { data: receipt, isMining: validatingTx } = useWatchTransaction({
    hash: data?.hash,
    label:
      operation === 'mint'
        ? `Mint ${tokenOut.symbol}`
        : `Redeem ${tokenIn.symbol}`,
  })

  const onGoingConfirmation = Boolean(
    (loadingApproval ||
      approvalSuccess ||
      loadingTx ||
      validatingTx ||
      receipt) &&
      !error
  )

  useEffect(() => {
    if (!approvalSuccess) return
    if (
      !error &&
      sendTransaction &&
      isIdleTx &&
      !(loadingTx || validatingTx || receipt)
    ) {
      sendTransaction()
    }
  }, [
    approvalSuccess,
    sendTransaction,
    zapResult?.tx,
    error,
    loadingTx,
    validatingTx,
    receipt,
    isIdleTx,
  ])

  useEffect(() => {
    if (sendError && !(loadingTx || validatingTx || receipt)) {
      setError({
        title: 'Transaction rejected',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
      mixpanel.track('User Rejected Zap', {
        Operation: operation,
        Endpoint: endpoint,
      })
    } else {
      setError(undefined)
    }
  }, [
    sendError,
    setError,
    loadingTx,
    validatingTx,
    receipt,
    operation,
    endpoint,
  ])

  useEffect(() => {
    if (!receipt) return
    if (receipt.status === 'success') {
      mixpanel.track('Zap Success', {
        Operation: operation,
        Endpoint: endpoint,
      })
    } else {
      mixpanel.track('Zap on-chain transaction reverted', {
        Operation: operation,
        Endpoint: endpoint,
        Error: `Transaction reverted: ${receipt.transactionHash}`,
      })
    }
    setOpenSubmitModal(false)
    resetZap()
  }, [receipt, operation, endpoint, setOpenSubmitModal, resetZap])

  return (
    <ZapTxContext.Provider
      value={{
        error,
        hasAllowance,
        loadingApproval,
        validatingApproval,
        approvalSuccess,
        approve,
        loadingTx,
        validatingTx: Boolean(validatingTx),
        sendTransaction,
        receipt,
        onGoingConfirmation,
      }}
    >
      {children}
    </ZapTxContext.Provider>
  )
}
