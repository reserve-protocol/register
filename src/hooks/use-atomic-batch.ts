import { chainIdAtom, isSafeMultisigAtom, walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useCapabilities } from 'wagmi'
import { notifyError } from './useNotification'

// `wallet_getCapabilities` (EIP-5792) is optional. Wallets that don't implement
// it (e.g. Coinbase Wallet) reject the probe instead of returning data: Coinbase
// answers with `InternalRpcError` (-32603) "this request method is not
// supported", others use the JSON-RPC "method not found" (-32601). That's not a
// failure — it just means atomic batching isn't available, so we fall back
// silently rather than alarming the user with a toast.
const isUnsupportedCapabilityError = (
  err?: { name?: string; message?: string; details?: string; code?: number } | null
) => {
  if (!err) return false
  const code = err.code
  if (code === -32601 || code === -32603 || code === 4200 || code === -32004) {
    return true
  }
  const haystack = `${err.name ?? ''} ${err.message ?? ''} ${
    err.details ?? ''
  }`.toLowerCase()
  return haystack.includes('not supported') || haystack.includes('method not found')
}

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
      // it below, so don't alarm the user with a toast. Likewise, wallets that
      // simply don't implement the method (Coinbase Wallet) shouldn't error out.
      if (
        isSafeMultisig ||
        name.includes('ConnectorNotConnected') ||
        name.includes('TypeError') ||
        isUnsupportedCapabilityError(error) ||
        isUnsupportedCapabilityError(failureReason)
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
