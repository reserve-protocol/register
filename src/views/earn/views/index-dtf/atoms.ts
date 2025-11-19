import { supportedChainList } from '@/utils/constants'
import { atom } from 'jotai'
import { VoteLockPosition } from './hooks/use-vote-lock-positions'

export const voteLockPositionsAtom = atom<VoteLockPosition[] | undefined>(
  undefined
)

export const searchFilterAtom = atom('')
export const chainsFilterAtom = atom(
  supportedChainList.map((chain) => chain.toString())
)
export const tokensFilterAtom = atom<string[]>([])
