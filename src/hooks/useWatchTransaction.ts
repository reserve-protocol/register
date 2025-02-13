import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { ReactNode, useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS } from 'utils/constants'
import { Hex, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import useNotification from './useNotification'

interface WatchOptions {
  hash: Hex | undefined
  label: ReactNode
  successMessage?: {
    title: string
    subtitle?: string
    type?: 'success' | 'error'
    icon?: ReactNode
  }
}

interface WatchResult {
  data?: TransactionReceipt
  isMining?: boolean
  status: 'success' | 'error' | 'pending' | 'idle'
  error?: string
}

// Watch tx status, send notifications and track history
const useWatchTransaction = ({
  hash,
  label,
  successMessage,
}: WatchOptions): WatchResult => {
  const notify = useNotification()
  const chainId = useAtomValue(chainIdAtom)

  const {
    data,
    status,
    error,
    isLoading: isMining,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: chainId === ChainId.Mainnet ? 1 : 3,
  })

  useEffect(() => {
    if (!hash || !data) return

    if (status === 'success') {
      notify(
        successMessage?.title ?? t`Transaction confirmed`,
        successMessage?.subtitle ?? `At block ${Number(data.blockNumber)}`,
        successMessage?.type ?? 'success',
        successMessage?.icon
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
  }, [hash, label, data, status, error, notify])

  return {
    data,
    isMining,
    status,
    error: error?.message,
  }
}

export default useWatchTransaction
