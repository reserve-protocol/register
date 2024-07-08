import { t } from '@lingui/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import {
  addTransactionAtom,
  updateTransactionAtom,
} from 'state/chain/atoms/transactionAtoms'
import { ChainId } from 'utils/chains'
import { Hex, TransactionReceipt } from 'viem'
import { useWaitForTransaction } from 'wagmi'
import useNotification from './useNotification'
import mixpanel from 'mixpanel-browser'
import { CHAIN_TAGS } from 'utils/constants'

interface WatchOptions {
  hash: Hex | undefined
  label: string
}

interface WatchResult {
  data?: TransactionReceipt
  isMining?: boolean
  status: 'success' | 'error' | 'loading' | 'idle'
  error?: string
}

// Watch tx status, send notifications and track history
const useWatchTransaction = ({ hash, label }: WatchOptions): WatchResult => {
  const notify = useNotification()
  const addTransaction = useSetAtom(addTransactionAtom)
  const updateTransaction = useSetAtom(updateTransactionAtom)
  const chainId = useAtomValue(chainIdAtom)

  const {
    data,
    status,
    error,
    isLoading: isMining,
  } = useWaitForTransaction({
    hash,
    confirmations: chainId === ChainId.Mainnet ? 1 : 3,
  })

  useEffect(() => {
    if (!hash) return
    addTransaction([hash, label])
    if (!data) return
    if (status === 'success') {
      updateTransaction([hash, 'success', Number(data.blockNumber)])
      notify(
        t`Transaction confirmed`,
        `At block ${Number(data.blockNumber)}`,
        'success'
      )
      mixpanel.track('transaction', {
        product: label,
        action: 'transaction_succeeded',
        payload: {
          type: label,
          chain: CHAIN_TAGS[chainId],
          hash: hash,
          blocknumber: Number(data.blockNumber),
        },
      })
    } else if (status === 'error') {
      updateTransaction([hash, 'error'])
      notify(
        t`Transaction reverted`,
        error?.message ?? 'Unknown error',
        'error'
      )
      mixpanel.track('transaction', {
        product: label,
        action: 'transaction_reverted',
        payload: {
          type: label,
          chain: CHAIN_TAGS[chainId],
          hash: hash,
          error: error?.message,
        },
      })
    }
  }, [
    hash,
    label,
    data,
    status,
    error,
    addTransaction,
    updateTransaction,
    notify,
  ])

  return {
    data,
    isMining,
    status,
    error: error?.message,
  }
}

export default useWatchTransaction
