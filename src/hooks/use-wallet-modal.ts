import { useAccountModal, useConnectModal } from 'solariskit'

// WHY: the kit exposes each opener only in its own state (connect while disconnected, account while connected).
export const useWalletModal = () => {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  return {
    openConnectModal: () => openConnectModal?.(),
    openAccountModal: () => openAccountModal?.(),
  }
}

export const useWalletModalOpen = () => {
  const { connectModalOpen } = useConnectModal()
  const { accountModalOpen } = useAccountModal()

  return connectModalOpen || accountModalOpen
}
