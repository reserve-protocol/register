import { ReactNode, useEffect } from 'react'
import { Hex, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { MIXPANEL_TOKEN } from '../utils/constants'
import { toast } from 'sonner'

interface WatchOptions {
  hash: Hex | undefined
  label: ReactNode
  successMessage?: {
    title: string
    subtitle?: string
    type?: 'success' | 'error'
    icon?: ReactNode
  }
  chainId?: number
}

interface WatchResult {
  data?: TransactionReceipt
  isMining?: boolean
  status: 'success' | 'error' | 'pending' | 'idle'
  error?: string
  isLoading?: boolean
  isSuccess?: boolean
}

/**
 * Hook to watch transaction status and send notifications
 * Monitors transaction confirmations and tracks analytics
 */
const useWatchTransaction = ({
  hash,
  label,
  successMessage,
  chainId = 1,
}: WatchOptions): WatchResult => {
  const {
    data,
    status,
    error,
    isLoading: isMining,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: chainId === 1 ? 1 : 3, // Mainnet uses 1, others use 3
  })

  useEffect(() => {
    if (!hash || !data) return

    if (status === 'success') {
      toast.success(successMessage?.title ?? 'Transaction confirmed', {
        description:
          successMessage?.subtitle ?? `At block ${Number(data.blockNumber)}`,
        icon: successMessage?.icon,
      })

      // Track with Mixpanel if available
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        ;(window as any).mixpanel.track('transaction', {
          product: label,
          action: 'transaction_succeeded',
          payload: {
            type: label,
            chain: chainId,
            hash: hash,
            blocknumber: Number(data.blockNumber),
          },
        })
      }
    } else if (status === 'error') {
      toast.error('Transaction reverted', {
        description: error?.message ?? 'Unknown error',
      })

      // Track with Mixpanel if available
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        ;(window as any).mixpanel.track('transaction', {
          product: label,
          action: 'transaction_reverted',
          payload: {
            type: label,
            chain: chainId,
            hash: hash,
            error: error?.message,
          },
        })
      }
    }
  }, [hash, data, status, error, successMessage, label, chainId])

  return {
    data,
    isMining,
    status,
    error: error?.message,
    isLoading: isMining,
    isSuccess: status === 'success',
  }
}

export default useWatchTransaction
