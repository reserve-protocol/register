import { providers } from 'ethers'
import { atom } from 'jotai'
import { supportedChains } from 'utils/chains'

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number>(1)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(0)
export const walletAtom = atom('')
export const providerAtom = atom(
  undefined as undefined | providers.Web3Provider
)

export const getValidWeb3Atom = atom((get) => {
  const provider = get(providerAtom)
  const account = get(walletAtom)
  const chainId = get(chainIdAtom)

  if (!provider || !supportedChains.has(chainId)) {
    return { provider: null, account: null, chainId: null }
  }

  return { provider, account, chainId }
})
