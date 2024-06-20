import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { walletAtom } from 'state/atoms'
import { isAddress } from 'utils'

export const trackedWalletsAtom = atomWithStorage<string[]>(
  'trackedWallets',
  []
)
export const trackedWalletAtom = atomWithStorage<string>('trackedWallet', '')
export const currentWalletAtom = atom((get) => {
  const trackedWallet = get(trackedWalletAtom)
  const connectedWallet = get(walletAtom)

  return connectedWallet || isAddress(trackedWallet) ? trackedWallet : null
})
