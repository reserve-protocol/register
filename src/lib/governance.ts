import { getCurrentTime } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Address, Hex } from 'viem'

export interface PartialProposal {
  id: string
  description: string
  creationTime: number
  state: string
  forWeightedVotes: number
  abstainWeightedVotes: number
  againstWeightedVotes: number
  executionETA?: number
  quorumVotes: number
  voteStart: number
  voteEnd: number
  executionBlock?: string
  proposer: {
    address: Address
  }
}

export type VotingState = {
  state: string
  deadline: null | number
  quorum: boolean
  for: number
  against: number
  abstain: number
}

export interface ProposalDetail extends PartialProposal {
  creationBlock: number
  calldatas: Hex[]
  queueBlock?: number
  queueTime?: string
  executionTime?: string
  cancellationTime?: string
  forDelegateVotes: string
  abstainDelegateVotes: string
  againstDelegateVotes: string
  executionTxnHash?: string
  targets: Address[]
  proposer: Address
  votes: {
    choice: string
    weight: string
    voter: string
  }[]
  governor: Address
  votingState: VotingState
}

export const getProposalState = (proposal: PartialProposal): VotingState => {
  const state: VotingState = {
    state: proposal?.state ?? '',
    deadline: null,
    quorum: false,
    for: 0,
    against: 0,
    abstain: 0,
  }

  const timestamp = getCurrentTime()

  // Proposal to be executed
  if (proposal.state === PROPOSAL_STATES.QUEUED && proposal.executionETA) {
    state.deadline = proposal.executionETA - timestamp
  } else if (proposal.state === PROPOSAL_STATES.PENDING) {
    if (timestamp > proposal.voteStart && timestamp < proposal.voteEnd) {
      state.state = PROPOSAL_STATES.ACTIVE
      state.deadline = proposal.voteEnd - timestamp
    } else if (timestamp < proposal.voteStart) {
      state.deadline = proposal.voteStart - timestamp
    } else {
      state.state = PROPOSAL_STATES.EXPIRED
    }
  } else if (proposal.state === PROPOSAL_STATES.ACTIVE) {
    // Proposal voting ended check status
    if (timestamp > proposal.voteEnd) {
      const forVotes = +proposal.forWeightedVotes
      const abstainVotes = +proposal.abstainWeightedVotes
      const againstVotes = +proposal.againstWeightedVotes
      const quorum = +proposal.quorumVotes

      if (againstVotes > forVotes) {
        state.state = PROPOSAL_STATES.DEFEATED
      } else if (forVotes + abstainVotes < quorum) {
        state.state = PROPOSAL_STATES.QUORUM_NOT_REACHED
      } else {
        state.state = PROPOSAL_STATES.SUCCEEDED
      }
    } else {
      state.deadline = proposal.voteEnd - timestamp
    }
  }

  const totalVotes =
    +proposal.forWeightedVotes +
    +proposal.againstWeightedVotes +
    +proposal.abstainWeightedVotes
  state.quorum = +proposal.forWeightedVotes >= +proposal.quorumVotes

  if (totalVotes) {
    state.for = (+proposal.forWeightedVotes / totalVotes) * 100
    state.abstain = (+proposal.abstainWeightedVotes / totalVotes) * 100
    state.against = (+proposal.againstWeightedVotes / totalVotes) * 100
  }

  return state
}
