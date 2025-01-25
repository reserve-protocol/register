import { atom } from 'jotai'
import { ChainId } from '@/utils/chains'
import { DTF_CATEGORIES } from '@/utils/constants'

export const searchFilterAtom = atom('')
// TODO(jg): Add category to branding?
export const categoryFilterAtom = atom<string[]>(Object.keys(DTF_CATEGORIES))
export const chainFilterAtom = atom<number[]>([ChainId.Base])
