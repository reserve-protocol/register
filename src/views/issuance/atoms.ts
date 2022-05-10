import { BigNumber } from '@ethersproject/bignumber'
import { atom } from 'jotai'

export const quantitiesAtom = atom<{ [x: string]: BigNumber }>({})
export const issueAmountAtom = atom('')
