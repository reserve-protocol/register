import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { walletAtom } from 'state/atoms'
import { isAddress } from 'utils'

export const trackedWalletsAtom = atomWithStorage<string[]>(
  'trackedWallets',
  []
)
export const trackedWalletAtom = atomWithStorage<string>('trackedWallet', '')
export const allWalletsAtom = atom((get) => {
  const tracked = get(trackedWalletsAtom)
  const connected = get(walletAtom)

  if (!connected || tracked.includes(connected)) {
    return tracked
  }

  return [...tracked, connected]
})
export const currentWalletAtom = atom((get) => {
  const trackedWallet = get(trackedWalletAtom)
  const connectedWallet = get(walletAtom)

  return isAddress(trackedWallet) ? trackedWallet : connectedWallet
})
