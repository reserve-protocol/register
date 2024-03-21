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
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi'

type ZapTxContextType = {
  error?: ZapErrorType
  setError: (error?: ZapErrorType) => void

  hasAllowance: boolean
  loadingApproval: boolean
  validatingApproval: boolean
  approvalSuccess: boolean
  approve?: () => void

  loadingTx: boolean
  validatingTx: boolean
  sendTransaction?: () => void
  receipt?: TransactionReceipt
}

const ZapTxContext = createContext<ZapTxContextType>({
  setError: () => {},
  hasAllowance: false,
  loadingApproval: false,
  validatingApproval: false,
  approvalSuccess: false,
  loadingTx: false,
  validatingTx: false,
})

export const useZapTx = () => {
  return useContext(ZapTxContext)
}

export const ZapTxProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [error, setError] = useState<ZapErrorType>()
  const { chainId, account, tokenIn, spender, amountIn, zapResult } = useZap()

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
    if (allowanceError) {
      setError({
        title: 'Transaction rejected',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
    } else {
      setError(undefined)
    }
  }, [allowanceError])

  // Transaction
  const { config } = usePrepareSendTransaction(
    zapResult
      ? {
          data: zapResult.tx.data as Address,
          gas: BigInt(zapResult.gas),
          to: zapResult.tx.to as Address,
          value: BigInt(zapResult.tx.value),
        }
      : undefined
  )

  const {
    data,
    isLoading: loadingTx,
    sendTransaction,
    error: sendError,
  } = useSendTransaction(config)

  const {
    data: receipt,
    isLoading: validatingTx,
    error: validatingTxError,
  } = useWaitForTransaction({
    hash: data?.hash,
    chainId,
  })

  useEffect(() => {
    if (approvalSuccess && sendTransaction) {
      sendTransaction()
    }
  }, [approvalSuccess, sendTransaction])

  useEffect(() => {
    if (sendError || validatingTxError) {
      setError({
        title: 'Transaction rejected',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
    } else {
      setError(undefined)
    }
  }, [sendError, validatingTxError, setError])

  return (
    <ZapTxContext.Provider
      value={{
        error,
        setError,
        hasAllowance,
        loadingApproval,
        validatingApproval,
        approvalSuccess,
        approve,
        loadingTx,
        validatingTx,
        sendTransaction,
        receipt,
      }}
    >
      {children}
    </ZapTxContext.Provider>
  )
}
