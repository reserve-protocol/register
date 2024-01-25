import { t } from '@lingui/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  addTransactionAtom,
  updateTransactionAtom,
} from 'state/chain/atoms/transactionAtoms'
import { Hex, TransactionReceipt } from 'viem'
import { waitForTransaction } from 'wagmi/actions'
import useIsMounted from './useIsMounted'
import useNotification from './useNotification'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'

interface WatchOptions {
  hash: Hex | undefined
  label: string
  success?: string
  error?: string
}

interface WatchResult {
  data?: TransactionReceipt
  isMining?: boolean
  status: 'success' | 'error' | 'loading' | 'idle'
}

// Watch tx status, send notifications and track history
const useWatchTransaction = ({ hash, success, error, label }: WatchOptions) => {
  const notify = useNotification()
  const addTransaction = useSetAtom(addTransactionAtom)
  const updateTransaction = useSetAtom(updateTransactionAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isMounted = useIsMounted()
  const [result, setResult] = useState({
    status: 'idle',
  } as WatchResult)

  // Use manual "waitForTransaction" action in order to still listen for transaction on component unmount
  const waitForTx = async (hash: Hex) => {
    try {
      setResult({
        status: 'loading',
        isMining: true,
      })

      // Give more time for base as blocks are faster
      const data = await waitForTransaction({
        hash,
        confirmations: chainId === ChainId.Mainnet ? 1 : 5,
      })

      updateTransaction([hash, 'success', Number(data.blockNumber)])
      notify(
        t`Transaction confirmed`,
        success ?? `At block ${Number(data.blockNumber)}`,
        'success'
      )

      if (isMounted) {
        setResult({
          data,
          status: 'success',
        })
      }
    } catch (e: any) {
      console.error('[TRANSACTION REVERTED]', e)
      notify(
        t`Transaction reverted`,
        error ?? e?.message ?? 'Unknown error',
        'error'
      )
      updateTransaction([hash, 'error'])
      if (isMounted) {
        setResult({ status: 'error' })
      }
    }
  }

  useEffect(() => {
    if (hash) {
      addTransaction([hash, label])
      waitForTx(hash)
    } else if (result.status !== 'idle') {
      setResult({ status: 'idle' })
    }
  }, [hash])

  return result
}

export default useWatchTransaction
