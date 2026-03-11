import { atom } from 'jotai'
import { ALL_TOP100_CHAINS } from './constants'

export const searchFilterAtom = atom('')
export const chainFilterAtom = atom<number[]>(ALL_TOP100_CHAINS)
