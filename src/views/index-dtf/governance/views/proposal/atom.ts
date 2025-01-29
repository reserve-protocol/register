import { ProposalDetail } from '@/lib/governance'
import { atom } from 'jotai'
import { Address, Hex, keccak256, toBytes } from 'viem'

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

export const proposalTxArgsAtom = atom(
  (get): [Address[], bigint[], Hex[], Hex] | undefined => {
    const proposal = get(proposalDetailAtom)

    if (!proposal) {
      return undefined
    }

    return [
      proposal.targets,
      new Array(proposal.targets.length).fill(0n),
      proposal.calldatas,
      keccak256(toBytes(proposal.description)),
    ]
  }
)
