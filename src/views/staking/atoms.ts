import { rsrBalanceAtom, stRsrBalanceAtom } from './../../state/atoms'
import { atom } from 'jotai'

const isValid = (value: number, max: number) => value > 0 && value <= max

export const stakeAmountAtom = atom('')
export const unStakeAmountAtom = atom('')
export const isValidStakeAmountAtom = atom((get) => {
  return isValid(Number(get(stakeAmountAtom) || 0), get(rsrBalanceAtom))
})
export const isValidUnStakeAmountAtom = atom((get) => {
  return isValid(Number(get(unStakeAmountAtom) || 0), get(stRsrBalanceAtom))
})
