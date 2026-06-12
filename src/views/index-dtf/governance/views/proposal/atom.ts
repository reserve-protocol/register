import { ProposalDetail } from '@/lib/governance'
import { atom } from 'jotai'

export const proposalDetailAtom = atom<ProposalDetail | undefined>(undefined)
export const accountVotesAtom = atom<{
  vote: null | string
  votePower: null | string
}>({
  vote: null,
  votePower: null,
})

export const proposalStateAtom = atom<string | undefined>((get) => {
  return get(proposalDetailAtom)?.votingState.state
})
