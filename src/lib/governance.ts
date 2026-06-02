import type {
  Amount,
  IndexDtfOptimisticProposalContext,
  IndexDtfProposalDecoded,
  ProposalVotingState,
  SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { Address, Hex } from 'viem'

export interface PartialProposal {
  id: string
  chainId: SupportedChainId
  timelockId?: Hex
  description: string
  creationTime: number
  creationBlock: number
  state: string
  forWeightedVotes: Amount
  abstainWeightedVotes: Amount
  againstWeightedVotes: Amount
  executionETA?: number
  executionTime?: string
  quorumVotes: Amount
  voteStart: number
  voteEnd: number
  executionBlock?: string
  isOptimistic?: boolean
  wasChallenged?: boolean
  challengedProposalId?: string
  vetoThreshold?: bigint
  voteToken: Address
  timelock: Address
  optimistic?: IndexDtfOptimisticProposalContext
  votingState: VotingState
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
  forVotesReachedQuorum?: boolean
  participationQuorumReached?: boolean
  vetoReached?: boolean
  threshold?: ProposalVotingState['threshold']
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
  decoded: IndexDtfProposalDecoded
  votes: {
    choice: string
    weight: Amount
    voter: Address
  }[]
  governor: Address
}
