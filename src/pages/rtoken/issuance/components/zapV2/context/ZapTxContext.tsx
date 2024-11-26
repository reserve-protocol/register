import useWatchTransaction from 'hooks/useWatchTransaction'
import mixpanel from 'mixpanel-browser'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Allowance } from 'types'
import { CHAIN_TAGS } from 'utils/constants'
import { Address, TransactionReceipt, parseUnits } from 'viem'
import { useSendTransaction } from 'wagmi'
import { useApproval } from '../hooks/useApproval'
import { useRevokeUSDT } from '../hooks/useRevokeUSDT'
import { ZapErrorType } from '../ZapError'
import { useZap } from './ZapContext'

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

  needsRevoke: boolean
  loadingRevoke: boolean
  revokeSuccess: boolean
  validatingRevoke: boolean
  revoke?: () => void
}

const ZapTxContext = createContext<ZapTxContextType>({
  hasAllowance: false,
  loadingApproval: false,
  validatingApproval: false,
  approvalSuccess: false,
  loadingTx: false,
  validatingTx: false,
  onGoingConfirmation: false,
  needsRevoke: false,
  loadingRevoke: false,
  revokeSuccess: false,
  validatingRevoke: false,
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
    isExpensiveZap,
    setShowEliteProgramModal,
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
    isLoading: loadingApproval,
    validatingApproval,
    isSuccess: approvalSuccess,
    approve,
    receipt: approvalReceipt,
    approvalSentError,
    approvalError,
    needsRevoke,
  } = useApproval(chainId, account, allowance)

  const {
    isLoading: loadingRevoke,
    isSuccess: revokeSuccess,
    validatingRevoke,
    revoke,
  } = useRevokeUSDT(chainId, account, allowance)

  useEffect(() => {
    if (approvalSuccess) {
      mixpanel.track('transaction', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'approval_succeeded',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
        },
      })
    }
  }, [
    approvalSuccess,
    operation,
    endpoint,
    chainId,
    account,
    tokenIn,
    tokenOut,
  ])

  useEffect(() => {
    if (approvalReceipt?.status === 'reverted' && approvalError) {
      mixpanel.track('transaction', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'approval_reverted',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
          transactionhash: approvalReceipt.transactionHash,
          error: approvalError.message,
        },
      })
    }
  }, [
    approvalReceipt,
    operation,
    endpoint,
    chainId,
    account,
    tokenIn,
    tokenOut,
  ])

  useEffect(() => {
    if (
      approvalSentError &&
      !(loadingApproval || validatingApproval || approvalSuccess)
    ) {
      setError({
        title: 'Transaction rejected: Approval failed',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })

      mixpanel.track('user_action', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'rejected_approval',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
        },
      })
    } else {
      setError(undefined)
    }
  }, [
    approvalSentError,
    approvalSuccess,
    loadingApproval,
    validatingApproval,
    operation,
    endpoint,
    chainId,
    account,
    tokenIn,
    tokenOut,
  ])

  const {
    data,
    isPending: loadingTx,
    isIdle: isIdleTx,
    sendTransaction,
    error: sendError,
  } = useSendTransaction()

  const {
    data: receipt,
    isMining: validatingTx,
    error: txError,
  } = useWatchTransaction({
    hash: data,
    label:
      operation === 'mint'
        ? `Mint ${tokenOut.symbol}`
        : `Redeem ${tokenIn.symbol}`,
  })

  const execute = useCallback(() => {
    if (zapResult?.tx) {
      sendTransaction({
        data: zapResult.tx.data as Address,
        gas: BigInt(zapResult.gas ?? 0) || undefined,
        to: zapResult.tx.to as Address,
        value: BigInt(zapResult.tx.value),
      })
    }
  }, [sendTransaction, zapResult])

  const onGoingConfirmation = Boolean(
    (loadingApproval ||
      approvalSuccess ||
      loadingTx ||
      validatingTx ||
      receipt ||
      loadingRevoke) &&
      !error
  )

  useEffect(() => {
    if (!approvalSuccess) return
    if (!error && isIdleTx && !(loadingTx || validatingTx || receipt)) {
      execute()
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
      mixpanel.track('user_action', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'rejected_zap',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
        },
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
    chainId,
    account,
    tokenIn,
    tokenOut,
  ])

  useEffect(() => {
    if (!receipt) return
    if (receipt.status === 'success') {
      mixpanel.track('transaction', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'transaction_succeeded',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
        },
      })
      // elite program
      if (operation === 'mint' && isExpensiveZap) {
        setShowEliteProgramModal(true)
        return
      }
    } else {
      mixpanel.track('transaction', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'transaction_reverted',
        payload: {
          operation: operation,
          rtoken: operation === 'mint' ? tokenOut.symbol : tokenIn.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          endpoint: endpoint,
          transactionhash: receipt.transactionHash,
          error: txError,
        },
      })
    }
    setOpenSubmitModal(false)
    resetZap()
  }, [
    receipt,
    operation,
    endpoint,
    setOpenSubmitModal,
    resetZap,
    chainId,
    account,
    tokenIn,
    tokenOut,
  ])

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
        sendTransaction: execute,
        receipt,
        onGoingConfirmation,
        needsRevoke,
        loadingRevoke,
        revokeSuccess,
        validatingRevoke,
        revoke,
      }}
    >
      {children}
    </ZapTxContext.Provider>
  )
}
