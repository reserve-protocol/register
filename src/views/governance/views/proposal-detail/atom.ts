import { BLOCK_DELAY, PROPOSAL_STATES } from './../../../../utils/constants'
import { atom } from 'jotai'
import { blockAtom } from 'state/atoms'
import { parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

export interface ProposalDetail {
  id: string
  description: string
  creationTime: string
  state: string
  calldatas: string[]
  startBlock: number
  endBlock: number
  queueBlock?: number
  executionStartBlock?: number
  executionETA?: number
  forWeightedVotes: string
  againstWeightedVotes: string
  abstainWeightedVotes: string
  forDelegateVotes: string
  abstainDelegateVotes: string
  againstDelegateVotes: string
  quorumVotes: string
  targets: string[]
  proposer: string
  votes: {
    choice: string
    weight: string
    voter: string
  }[]
}

export const proposalDetailAtom = atom<null | ProposalDetail>(null)
export const accountVotesAtom = atom<{
  vote: null | string
  votePower: null | string
}>({
  vote: null,
  votePower: null,
})

export const getProposalStatus = (
  proposal: Partial<ProposalDetail>,
  blockNumber: number
): string => {
  let status: string = proposal.state || PROPOSAL_STATES.PENDING

  if (!blockNumber) {
    return status
  }

  if (proposal.state === PROPOSAL_STATES.PENDING) {
    if (blockNumber > (proposal.endBlock || 0)) {
      return PROPOSAL_STATES.EXPIRED
    }

    if (blockNumber > (proposal.startBlock || 0)) {
      return PROPOSAL_STATES.ACTIVE
    }
  }

  if (
    proposal.state === PROPOSAL_STATES.ACTIVE &&
    blockNumber > (proposal.endBlock || 0)
  ) {
    const forVotes = BigNumber.from(proposal.forWeightedVotes)
    const againstVotes = BigNumber.from(proposal.againstWeightedVotes)
    const quorum = BigNumber.from(proposal.quorumVotes)

    if (forVotes.lte(againstVotes)) {
      return PROPOSAL_STATES.DEFEATED
    } else if (forVotes.lt(quorum)) {
      return PROPOSAL_STATES.QUORUM_NOT_REACHED
    }
    return PROPOSAL_STATES.SUCCEEDED
  }

  return status
}

export const getProposalStateAtom = atom((get) => {
  const blockNumber = get(blockAtom)
  const proposal = get(proposalDetailAtom)

  const state: { state: string; deadline: null | number } = {
    state: proposal?.state ?? '',
    deadline: null,
  }

  if (blockNumber && proposal) {
    // Proposal to be executed
    // TODO: Guardian can cancel on this state!
    if (
      proposal.state === PROPOSAL_STATES.QUEUED &&
      proposal.executionStartBlock &&
      proposal.executionStartBlock > blockNumber
    ) {
      state.deadline =
        (proposal.executionStartBlock - blockNumber) * BLOCK_DELAY
    } else if (proposal.state === PROPOSAL_STATES.PENDING) {
      if (
        blockNumber > proposal.startBlock &&
        blockNumber < proposal.endBlock
      ) {
        state.state = PROPOSAL_STATES.ACTIVE
        state.deadline = (proposal.endBlock - blockNumber) * BLOCK_DELAY
      } else if (blockNumber < proposal.startBlock) {
        state.deadline = (proposal.startBlock - blockNumber) * BLOCK_DELAY
      } else {
        state.state = PROPOSAL_STATES.EXPIRED
      }
    } else if (proposal.state === PROPOSAL_STATES.ACTIVE) {
      // Proposal voting ended check status
      if (blockNumber > proposal.endBlock) {
        const forVotes = parseEther(proposal.forWeightedVotes)
        const againstVotes = parseEther(proposal.againstWeightedVotes)
        const quorum = parseEther(proposal.quorumVotes)

        if (forVotes.lte(againstVotes)) {
          state.state = PROPOSAL_STATES.DEFEATED
        } else if (forVotes.lt(quorum)) {
          state.state = PROPOSAL_STATES.QUORUM_NOT_REACHED
        } else {
          state.state = PROPOSAL_STATES.SUCCEEDED
        }
      } else {
        state.deadline = (proposal.endBlock - blockNumber) * BLOCK_DELAY
      }
    }
  }

  return state
})
