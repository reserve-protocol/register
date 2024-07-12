import { AccountData } from 'hooks/useAccounts'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { walletAtom } from 'state/atoms'
import { isAddress, shortenAddress } from 'utils'

type Wallet = {
  address: string
  shortedAddress: string
  current: boolean
  connected: boolean
}

export const trackedWalletsAtom = atomWithStorage<string[]>(
  'trackedWallets',
  []
)
export const trackedWalletAtom = atomWithStorage<string>('trackedWallet', '')

export const allWalletsAtom = atom<Wallet[]>((get) => {
  const tracked = get(trackedWalletsAtom)
  const connected = get(walletAtom)
  const selected = get(currentWalletAtom)

  const all = [
    ...(connected ? [connected] : []),
    ...tracked.filter((address) => address !== connected),
  ]

  return all.map((address) => ({
    address,
    shortedAddress: shortenAddress(address),
    current: address === selected,
    connected: address === connected,
  }))
})

export const allWalletsAccountsAtom = atom<Record<string, AccountData>>({})

export const currentWalletAtom = atom((get) => {
  const trackedWallet = get(trackedWalletAtom)
  const connectedWallet = get(walletAtom)

  return isAddress(trackedWallet) ? trackedWallet : connectedWallet
})
