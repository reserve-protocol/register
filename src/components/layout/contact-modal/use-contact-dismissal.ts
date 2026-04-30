import { Address } from 'viem'

const KEY_PREFIX = 'register:contact-modal-dismissed:'

export const getContactDismissalKey = (wallet: Address) =>
  `${KEY_PREFIX}${wallet.toLowerCase()}`

export const useContactDismissal = (wallet: Address | null | undefined) => {
  return {
    dismiss: () => {
      if (wallet) localStorage.setItem(getContactDismissalKey(wallet), '1')
    },
  }
}
