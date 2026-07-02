import { useDisconnect } from 'wagmi'

// WHY: tear down any lingering connector state before opening the connect
// modal. Without this, a fresh Safe-over-WalletConnect connect can hang in
// "connecting" and never resolve, leaving the app showing disconnected until a
// manual refresh (the Gnosis-required flow already does this and connects
// reliably). A no-op for the common disconnected case, so other wallets are
// unaffected.
export const useConnectWithReset = () => {
  const { disconnectAsync } = useDisconnect()

  return async (openConnectModal: () => void) => {
    try {
      await disconnectAsync()
    } catch {
      // ignore — nothing to disconnect
    }
    openConnectModal()
  }
}
