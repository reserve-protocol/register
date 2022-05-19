import { BigNumberMap } from './../../types/index'
import { atom } from 'jotai'

export const quantitiesAtom = atom<BigNumberMap>({})
export const issueAmountAtom = atom('')
export const redeemAmountAtom = atom('')
export const maxIssuableAtom = atom(0)
export const isValidIssuableAmountAtom = atom((get) => {
  const amount = Number(get(issueAmountAtom))
  const max = Number(get(maxIssuableAtom))

  return amount > 0 && amount <= max
})
