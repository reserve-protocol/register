import { atom } from 'jotai'
import { ChainId } from '@/utils/chains'

export const dtfTypeFilterAtom = atom<'index' | 'yield'>('index')
export const searchFilterAtom = atom('')
export const chainFilterAtom = atom<number[]>([
  ChainId.Mainnet,
  ChainId.Base,
  ChainId.BSC,
])
