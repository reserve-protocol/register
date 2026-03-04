import { atom } from 'jotai'
import { ACTIVE_CHAINS } from './constants'

export const searchFilterAtom = atom('')
export const chainFilterAtom = atom<number[]>(ACTIVE_CHAINS)
