import { atom } from 'jotai'
import { ChainId } from '@/utils/chains'

export const searchFilterAtom = atom('')
export const chainFilterAtom = atom<number[]>([ChainId.Base])
