import { BigNumberMap } from './../../types/index'
import { atom } from 'jotai'

export const quantitiesAtom = atom<BigNumberMap>({})
export const issueAmountAtom = atom('')
export const maxIssuableAtom = atom(0)
