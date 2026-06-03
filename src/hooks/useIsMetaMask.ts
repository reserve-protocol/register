import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

type InjectedProvider = {
  isMetaMask?: boolean
  isRabby?: boolean
  isBraveWallet?: boolean
}

// Detects whether the *connected* wallet is MetaMask. We read the active
// connector's EIP-1193 provider rather than the global `window.ethereum` so the
// result reflects the wallet actually in use (RainbowKit exposes MetaMask through
// the generic `injected` connector, so the connector id alone is not enough).
// Look-alikes that also set `isMetaMask` (Rabby, Brave) are excluded.
export const useIsMetaMask = (): boolean => {
  const { connector, isConnected } = useAccount()
  const [isMetaMask, setIsMetaMask] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!isConnected || !connector?.getProvider) {
      setIsMetaMask(false)
      return
    }

    connector
      .getProvider()
      .then((provider) => {
        if (cancelled) return
        const p = provider as InjectedProvider | undefined
        setIsMetaMask(Boolean(p?.isMetaMask) && !p?.isRabby && !p?.isBraveWallet)
      })
      .catch(() => {
        if (!cancelled) setIsMetaMask(false)
      })

    return () => {
      cancelled = true
    }
  }, [connector, isConnected])

  return isMetaMask
}
