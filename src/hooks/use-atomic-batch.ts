import { chainIdAtom, isSafeMultisigAtom, walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useCapabilities } from 'wagmi'
import { notifyError } from './useNotification'

const useAtomicBatch = () => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const isSafeMultisig = useAtomValue(isSafeMultisigAtom)
  const { data, isLoading, failureReason, error } = useCapabilities({
    chainId,
    query: {
      // A Safe already tells us atomic batching is available, so skip the probe.
      // Some Safe connectors never resolve `wallet_getCapabilities`, leaving the
      // query pending forever — which would otherwise hang the wizard skeleton.
      enabled: !!account && !isSafeMultisig,
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

      // Capability probing is best-effort feature detection. Some Safes resolve
      // `wallet_getCapabilities` to undefined (React Query then surfaces a "data
      // is undefined" error); when we already know it's a Safe we fall back to
      // it below, so don't alarm the user with a toast.
      if (
        isSafeMultisig ||
        name.includes('ConnectorNotConnected') ||
        name.includes('TypeError')
      ) {
        return
      }

      notifyError(name, message)
    }
  }, [error, failureReason, isSafeMultisig])

  return {
    // A Safe (smart-account) supports atomic batching even when the wallet
    // doesn't report EIP-5792 capabilities, so treat it as supported.
    atomicSupported: atomicBatchSupported || atomicSupported || isSafeMultisig,
    // Once we know it's a Safe the answer is settled — don't report loading (the
    // capabilities query may still be pending/disabled and would block the UI).
    isLoading: isLoading && !failureReason && !isSafeMultisig,
  }
}

export default useAtomicBatch
