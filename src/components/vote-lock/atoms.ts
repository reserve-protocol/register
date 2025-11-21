import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { formatUnits } from 'viem'

export type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
}

export type StTokenExtended = {
  id: string // staking vault address
  chainId: number
  token: Token // vote-locked token
  underlying: Token // underlying governance token
}

// Main stToken atom that will be set from props
export const stTokenAtom = atomWithReset<StTokenExtended | undefined>(
  undefined
)

export const currentStakingTabAtom = atomWithReset<'lock' | 'unlock'>('lock')
export const stakingInputAtom = atomWithReset<string>('')
export const underlyingStTokenPriceAtom = atomWithReset<number | undefined>(
  undefined
)
export const underlyingBalanceAtom = atomWithReset<bigint | undefined>(
  undefined
)
export const unlockBalanceRawAtom = atomWithReset<bigint | undefined>(undefined)
export const unlockDelayAtom = atomWithReset<number | undefined>(undefined)
export const lockCheckboxAtom = atomWithReset<boolean>(false)
export const currentDelegateAtom = atomWithReset<string>('')
export const delegateAtom = atomWithReset<string>('')

// Atom to trigger drawer close from child components
export const closeDrawerAtom = atom(false)

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
