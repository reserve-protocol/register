import { BLOCK_DELAY, PROPOSAL_STATES } from './../../../../utils/constants'
import { atom } from 'jotai'
import { blockAtom, rTokenGovernanceAtom } from 'state/atoms'
import { parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { Address, Hex, keccak256, toBytes } from 'viem'

export interface ProposalDetail {
  id: string
  description: string
  creationTime: string
  state: string
  calldatas: Hex[]
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
  targets: Address[]
  proposer: Address
  votes: {
    choice: string
    weight: string
    voter: string
  }[]
  governor: Address
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

export const proposalTxArgsAtom = atom(
  (get): [Address[], bigint[], Hex[], Hex] | undefined => {
    const governance = get(rTokenGovernanceAtom)
    const proposal = get(proposalDetailAtom)

    if (
      !proposal ||
      !proposal.calldatas.length ||
      !proposal.description ||
      !governance.governor
    ) {
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
