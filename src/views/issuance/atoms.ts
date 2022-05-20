import { rTokenBalanceAtom } from './../../state/atoms'
import { BigNumberMap } from './../../types/index'
import { atom } from 'jotai'

const isValid = (value: number, max: number) => value > 0 && value <= max

export const quantitiesAtom = atom<BigNumberMap>({})
export const issueAmountAtom = atom('')
export const redeemAmountAtom = atom('')
export const isValidRedeemAmountAtom = atom((get) => {
  return isValid(Number(get(redeemAmountAtom) || 0), get(rTokenBalanceAtom))
})
export const maxIssuableAtom = atom(0)
export const isValidIssuableAmountAtom = atom((get) => {
  return isValid(Number(get(issueAmountAtom) || 0), get(maxIssuableAtom))
})
