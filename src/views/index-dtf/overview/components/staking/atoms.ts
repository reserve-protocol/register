import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { formatUnits } from 'viem'

export const stakingInputAtom = atom<string>('')
export const underlyingStTokenPriceAtom = atom<number | undefined>(undefined)
export const underlyingBalanceAtom = atom<bigint | undefined>(undefined)

export const inputPriceAtom = atom<number>((get) => {
  const input = get(stakingInputAtom)
  const price = get(underlyingStTokenPriceAtom)
  return price ? price * Number(input) : 0
})

export const inputBalanceAtom = atom<string>((get) => {
  const indexDTF = get(indexDTFAtom)
  const balance = get(underlyingBalanceAtom)
  const decimals = indexDTF?.stToken?.underlying.decimals

  return decimals && balance ? formatUnits(balance, decimals) : '0'
})
