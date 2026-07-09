import { ProposalDetail } from '@/lib/governance'
import { atom } from 'jotai'

export const proposalDetailAtom = atom<ProposalDetail | undefined>(undefined)
export const accountVotesAtom = atom<{
  vote: null | string
  votePower: null | string
  hasProposalVotingPower: null | boolean
}>({
  vote: null,
  votePower: null,
  hasProposalVotingPower: null,
})

export const proposalStateAtom = atom<string | undefined>((get) => {
  return get(proposalDetailAtom)?.votingState.state
})
