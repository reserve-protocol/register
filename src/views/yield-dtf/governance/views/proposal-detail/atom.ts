import { PROPOSAL_STATES, blockDuration } from 'utils/constants'
import { atom } from 'jotai'
import { blockAtom, chainIdAtom, rTokenGovernanceAtom } from 'state/atoms'
import { Address, Hex, keccak256, parseEther, toBytes } from 'viem'
import { TenderlySimulation } from 'types'
import { atomWithReset } from 'jotai/utils'
import { getCurrentTime } from 'utils'
import { isTimeunitGovernance } from '@/views/yield-dtf/governance/utils'
import {
  getGovernorTimelockOperationIdV4,
  getYieldDtfProposalState,
  type Amount,
} from '@reserve-protocol/react-sdk'

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

// Vote weights arrive as decimal-ether strings; parseEther keeps them exact
// (a Number cast is lossy above 2^53 and mishandles ties).
const weiAmount = (value?: string): Amount => {
  const raw = parseEther(value ?? '0')
  return { raw, formatted: value ?? '0' }
}

// WHY (Z18): the tie / >2^53-wei-sensitive terminal outcome is delegated to the
// SDK's audited derivation (OZ GovernorCountingSimple strict majority, bigint)
// so the explorer list, the detail badges, and getProposalStatus share ONE
// source of truth and can't disagree at a boundary. Callers gate this on
// `currentTimepoint > voteEnd`, so forcing state ACTIVE yields the terminal
// state (SUCCEEDED / DEFEATED / QUORUM_NOT_REACHED) only.
const deriveTerminalOutcome = (
  proposal: Partial<ProposalDetail>,
  currentTimepoint: number
): string =>
  getYieldDtfProposalState(
    {
      state: 'ACTIVE',
      voteStart: Number(proposal.startBlock ?? 0),
      voteEnd: Number(proposal.endBlock ?? 0),
      forWeightedVotes: weiAmount(proposal.forWeightedVotes),
      againstWeightedVotes: weiAmount(proposal.againstWeightedVotes),
      abstainWeightedVotes: weiAmount(proposal.abstainWeightedVotes),
      quorumVotes: weiAmount(proposal.quorumVotes),
    },
    currentTimepoint
  )

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
    return deriveTerminalOutcome(proposal, timeunit)
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
        state.state = deriveTerminalOutcome(proposal, timeunit)
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
    const forVotesRaw = parseEther(proposal.forWeightedVotes)
    state.quorum =
      forVotesRaw > 0n && forVotesRaw >= parseEther(proposal.quorumVotes)

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
        state.state = deriveTerminalOutcome(proposal, timeunit)
      } else {
        state.deadline = isTimeunit
          ? proposal.endBlock - timestamp
          : (proposal.endBlock - blockNumber) * BLOCK_DURATION
      }
    }
  }

  return state
})

// WHY (Z17): the queue/execute args and the timelock operation id must derive
// their zero-values array from the SAME targets, or they drift — a hardcoded
// single-element `[0n]` produced the wrong operation id for every multi-action
// proposal, silently disabling the guardian Cancel button. Both consumers build
// from this one payload; the id delegates to the SDK's audited V4 batch hash.
const toTimelockPayload = (proposal: ProposalDetail) => ({
  governor: proposal.governor,
  targets: proposal.targets,
  calldatas: proposal.calldatas,
  description: proposal.description,
})

export const proposalTxArgsAtom = atom(
  (get): [Address[], bigint[], Hex[], Hex] | undefined => {
    const governance = get(rTokenGovernanceAtom)
    const proposal = get(proposalDetailAtom)

    if (!proposal || !proposal.calldatas.length || !governance.governor) {
      return undefined
    }

    const payload = toTimelockPayload(proposal)

    return [
      payload.targets,
      payload.targets.map(() => 0n),
      payload.calldatas,
      keccak256(toBytes(payload.description)),
    ]
  }
)

export const timelockIdAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)

  if (!proposal) return undefined

  return getGovernorTimelockOperationIdV4(toTimelockPayload(proposal))
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
