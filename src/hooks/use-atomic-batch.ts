import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useCapabilities } from 'wagmi'
import { notifyError } from './useNotification'

const useAtomicBatch = () => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const { data, isLoading, failureReason, error } = useCapabilities({
    chainId,
    query: {
      enabled: !!account,
    },
  })
  const atomicBatchSupported = data?.atomicBatch?.supported
  const atomicSupported = ['ready', 'supported'].includes(
    data?.atomic?.status ?? ''
  )

  useEffect(() => {
    if (error || failureReason) {
      const name = error?.name || failureReason?.name || 'Error'
      const message =
        error?.message || failureReason?.message || 'Unknown error'

      if (
        name.includes('ConnectorNotConnected') ||
        name.includes('TypeError')
      ) {
        return
      }

      notifyError(name, message)
    }
  }, [error, failureReason])

  return {
    atomicSupported: atomicBatchSupported || atomicSupported,
    isLoading: isLoading && !failureReason,
  }
}

export default useAtomicBatch
