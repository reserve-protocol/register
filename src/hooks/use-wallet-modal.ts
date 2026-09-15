import { useAppKit, useAppKitState } from '@reown/appkit/react'

export const useWalletModal = () => {
  const { open } = useAppKit()

  return {
    openConnectModal: () => {
      open({ view: 'Connect' })
    },
    openAccountModal: () => {
      open({ view: 'Account' })
    },
  }
}

// WHY: separate hook — useAppKitState re-renders on every AppKit state change,
// and only the seamless transaction flow needs the (any-view) open flag.
export const useWalletModalOpen = () => useAppKitState().open
