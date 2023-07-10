import { t } from '@lingui/macro'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { addTransactionAtom, updateTransactionAtom } from 'state/chain/atoms'
import { Hex } from 'viem'
import { useWaitForTransaction } from 'wagmi'
import useNotification from './useNotification'
import { getCurrentTime } from 'utils'

interface WatchOptions {
  hash: Hex | undefined
  label: string
  success?: string
  error?: string
}

// Watch tx status, send notifications and track history
const useWatchTransaction = ({ hash, success, error, label }: WatchOptions) => {
  const notify = useNotification()
  const addTransaction = useSetAtom(addTransactionAtom)
  const updateTransaction = useSetAtom(updateTransactionAtom)
  const result = useWaitForTransaction({
    hash,
  })

  useEffect(() => {
    if (hash) {
      addTransaction([hash, label])
    }
  }, [hash])

  useEffect(() => {
    if (hash && (result.status === 'success' || result.status === 'error')) {
      updateTransaction([hash, result.status])

      if (result.status === 'error') {
        notify(
          t`Transaction failed`,
          error ?? result.error?.message ?? 'Unknown error',
          'error'
        )
      } else {
        notify(
          t`Transaction confirmed`,
          success ?? `At block ${Number(result.data?.blockNumber ?? 0n)}`,
          'success'
        )
      }
    }
  }, [result.status])

  return result
}

export default useWatchTransaction
