import { PROPOSAL_STATES, blockDuration } from 'utils/constants'
import { atom } from 'jotai'
import { blockAtom, chainIdAtom, rTokenGovernanceAtom } from 'state/atoms'
import {
  Address,
  Hex,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  parseEther,
  toBytes,
} from 'viem'
import { TenderlySimulation } from 'types'
import { atomWithReset } from 'jotai/utils'
import { getCurrentTime } from 'utils'
import { isTimeunitGovernance } from '@/views/rtoken/governance/utils'

export interface ProposalDetail {
  id: string
  description: string
  creationTime: string
  creationBlock: number
  state: string
  calldatas: Hex[]
  startBlock: number
  endBlock: number
  queueBlock?: number
  queueTime?: string
  executionETA?: number
  executionTime?: string
  cancellationTime?: string
  forWeightedVotes: string
  againstWeightedVotes: string
  abstainWeightedVotes: string
  forDelegateVotes: string
  abstainDelegateVotes: string
  againstDelegateVotes: string
  executionTxnHash: string
  quorumVotes: string
  version: string
  targets: Address[]
  proposer: Address
  votes: {
    choice: string
    weight: string
    voter: string
  }[]
  governor: Address
  governanceFramework?: { name: string }
}

export type SimulationState = {
  data: TenderlySimulation | null
  loading: boolean
  error: Error | null
}

export type ProposalVotingState = {
  state: string
  deadline: null | number
  quorum: boolean
  for: number
  against: number
  abstain: number
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
  const timeunit = isTimeunitGovernance(
    proposal?.governanceFramework?.name ?? '1'
  )
    ? getCurrentTime()
    : blockNumber

  if (!blockNumber || !proposal) {
    return status
  }

  if (proposal.state === PROPOSAL_STATES.PENDING) {
    if (timeunit > (proposal.endBlock || 0)) {
      return PROPOSAL_STATES.EXPIRED
    }

    if (timeunit > (proposal.startBlock || 0)) {
      return PROPOSAL_STATES.ACTIVE
    }
  }

  if (
    proposal.state === PROPOSAL_STATES.ACTIVE &&
    timeunit > (proposal.endBlock || 0)
  ) {
    const forVotes = parseEther(proposal.forWeightedVotes ?? '0')
    const againstVotes = parseEther(proposal.againstWeightedVotes ?? '0')
    const quorum = parseEther(proposal.quorumVotes ?? '0')

    if (forVotes <= againstVotes) {
      return PROPOSAL_STATES.DEFEATED
    } else if (forVotes < quorum) {
      return PROPOSAL_STATES.QUORUM_NOT_REACHED
    }
    return PROPOSAL_STATES.SUCCEEDED
  }

  return status
}

export const getProposalState = (
  proposal: Partial<ProposalDetail>,
  blockNumber: number,
  chainId: number
): ProposalVotingState => {
  const timestamp = getCurrentTime()

  const BLOCK_DURATION = blockDuration[chainId]

  const state: {
    state: string
    deadline: null | number
    quorum: boolean
    for: number
    against: number
    abstain: number
  } = {
    state: proposal?.state ?? '',
    deadline: null,
    quorum: false,
    for: 0,
    against: 0,
    abstain: 0,
  }

  if (
    blockNumber &&
    proposal &&
    proposal.startBlock &&
    proposal.endBlock &&
    proposal.forWeightedVotes &&
    proposal.abstainWeightedVotes &&
    proposal.againstWeightedVotes &&
    proposal.quorumVotes
  ) {
    const isTimeunit = isTimeunitGovernance(
      proposal?.governanceFramework?.name ?? '1'
    )
    const timeunit = isTimeunit ? timestamp : blockNumber

    // Proposal to be executed
    // TODO: Guardian can cancel on this state!
    if (proposal.state === PROPOSAL_STATES.QUEUED && proposal.executionETA) {
      state.deadline = proposal.executionETA - timestamp
    } else if (proposal.state === PROPOSAL_STATES.PENDING) {
      if (timeunit > proposal.startBlock && timeunit < proposal.endBlock) {
        state.state = PROPOSAL_STATES.ACTIVE
        state.deadline = isTimeunit
          ? proposal.endBlock - timestamp
          : (proposal.endBlock - blockNumber) * BLOCK_DURATION
      } else if (timeunit < proposal.startBlock) {
        state.deadline = isTimeunit
          ? proposal.startBlock - timestamp
          : (proposal.startBlock - blockNumber) * BLOCK_DURATION
      } else {
        state.state = PROPOSAL_STATES.EXPIRED
      }
    } else if (proposal.state === PROPOSAL_STATES.ACTIVE) {
      // Proposal voting ended check status
      if (timeunit > proposal.endBlock) {
        const forVotes = +proposal.forWeightedVotes
        const againstVotes = +proposal.againstWeightedVotes
        const quorum = +proposal.quorumVotes

        if (againstVotes > forVotes) {
          state.state = PROPOSAL_STATES.DEFEATED
        } else if (forVotes < quorum) {
          state.state = PROPOSAL_STATES.QUORUM_NOT_REACHED
        } else {
          state.state = PROPOSAL_STATES.SUCCEEDED
        }
      } else {
        state.deadline = isTimeunit
          ? proposal.endBlock - timestamp
          : (proposal.endBlock - blockNumber) * BLOCK_DURATION
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
  }

  return state
}

export const getProposalStateAtom = atom((get) => {
  const blockNumber = get(blockAtom)
  const timestamp = getCurrentTime()
  const proposal = get(proposalDetailAtom)
  const chainId = get(chainIdAtom)

  const BLOCK_DURATION = blockDuration[chainId]

  const state: { state: string; deadline: null | number } = {
    state: proposal?.state ?? '',
    deadline: null,
  }

  if (blockNumber && proposal) {
    const isTimeunit = isTimeunitGovernance(proposal.version)
    const timeunit = isTimeunit ? timestamp : blockNumber

    // Proposal to be executed
    // TODO: Guardian can cancel on this state!
    if (proposal.state === PROPOSAL_STATES.QUEUED && proposal.executionETA) {
      state.deadline = proposal.executionETA - timestamp
    } else if (proposal.state === PROPOSAL_STATES.PENDING) {
      if (timeunit > proposal.startBlock && timeunit < proposal.endBlock) {
        state.state = PROPOSAL_STATES.ACTIVE
        state.deadline = isTimeunit
          ? proposal.endBlock - timestamp
          : (proposal.endBlock - blockNumber) * BLOCK_DURATION
      } else if (timeunit < proposal.startBlock) {
        state.deadline = isTimeunit
          ? proposal.startBlock - timestamp
          : (proposal.startBlock - blockNumber) * BLOCK_DURATION
      } else {
        state.state = PROPOSAL_STATES.EXPIRED
      }
    } else if (proposal.state === PROPOSAL_STATES.ACTIVE) {
      // Proposal voting ended check status
      if (timeunit > proposal.endBlock) {
        const forVotes = +proposal.forWeightedVotes
        const againstVotes = +proposal.againstWeightedVotes
        const quorum = +proposal.quorumVotes

        if (againstVotes > forVotes) {
          state.state = PROPOSAL_STATES.DEFEATED
        } else if (forVotes < quorum) {
          state.state = PROPOSAL_STATES.QUORUM_NOT_REACHED
        } else {
          state.state = PROPOSAL_STATES.SUCCEEDED
        }
      } else {
        state.deadline = isTimeunit
          ? proposal.endBlock - timestamp
          : (proposal.endBlock - blockNumber) * BLOCK_DURATION
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

export const timelockIdAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)

  const encodedParams = proposal
    ? encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
        [
          proposal.targets,
          [0n],
          proposal.calldatas,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          keccak256(toBytes(proposal.description)),
        ]
      )
    : undefined

  return encodedParams ? keccak256(encodedParams) : undefined
})

export const canExecuteAtom = atom((get) => {
  const timestamp = getCurrentTime()
  const proposal = get(proposalDetailAtom)

  return proposal?.executionETA && proposal.executionETA <= timestamp
})

export const simulationStateAtom = atomWithReset<SimulationState>({
  data: null,
  loading: false,
  error: null,
})
