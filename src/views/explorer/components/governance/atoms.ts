import { type VotingState } from '@/lib/governance'
import { atom } from 'jotai'

export type DTFType = 'all' | 'yield' | 'index'

export interface ProposalRecord {
  id: string
  description: string
  creationTime: string
  votingState: VotingState
  governance: string
  forWeightedVotes: string
  againstWeightedVotes: string
  quorumVotes: string
  status: string
  tokenAddress: string
  tokenSymbol: string
  tokenLogo?: string
  chain: number
  type: DTFType
}

interface IFilters {
  tokens: string[] // empty => all
  status: string[]
  type: DTFType
}

export const filtersAtom = atom<IFilters>({
  tokens: [],
  status: [],
  type: 'all',
})
