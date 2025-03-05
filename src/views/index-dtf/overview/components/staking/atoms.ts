import { indexDTFAtom } from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { formatUnits } from 'viem'

export const stakingSidebarOpenAtom = atom(false)
export const portfolioStTokenAtom = atomWithReset<
  IndexDTF['stToken'] | undefined
>(undefined)
export const currentStakingTabAtom = atom<'lock' | 'unlock'>('lock')
export const stakingInputAtom = atomWithReset<string>('')
export const underlyingStTokenPriceAtom = atom<number | undefined>(undefined)
export const underlyingBalanceAtom = atom<bigint | undefined>(undefined)
export const unlockBalanceRawAtom = atom<bigint | undefined>(undefined)
export const unlockDelayAtom = atom<number | undefined>(undefined)
export const lockCheckboxAtom = atom<boolean>(false)

export const stTokenAtom = atom<IndexDTF['stToken'] | undefined>(
  (get) => get(portfolioStTokenAtom) || get(indexDTFAtom)?.stToken
)

export const inputPriceAtom = atom<number>((get) => {
  const input = get(stakingInputAtom)
  const price = get(underlyingStTokenPriceAtom)
  return price ? price * Number(input) : 0
})

export const inputBalanceAtom = atom<string>((get) => {
  const stToken = get(stTokenAtom)
  const balance = get(underlyingBalanceAtom)
  const decimals = stToken?.underlying.decimals

  return decimals && balance ? formatUnits(balance, decimals) : '0'
})

export const unlockBalanceAtom = atom<string>((get) => {
  const stToken = get(stTokenAtom)
  const unlockBalanceRaw = get(unlockBalanceRawAtom)
  const decimals = stToken?.token.decimals

  return decimals && unlockBalanceRaw
    ? formatUnits(unlockBalanceRaw, decimals)
    : '0'
})
