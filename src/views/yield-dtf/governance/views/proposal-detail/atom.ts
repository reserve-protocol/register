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

// The two seams feed vote weights in DIFFERENT units: the explorer list passes
// RAW subgraph wei strings, the detail path normalizes through `formatEther`
// (decimal ether). `parseEther` accepts both — an integer wei string is scaled
// uniformly across all four fields (the outcome is scale-invariant), and a
// formatted-ether string round-trips exactly — so the bigint comparison is exact
// in both, unlike the old `Number` cast (lossy above 2^53, mishandles ties).
const weiAmount = (value?: string): Amount => {
  const raw = parseEther(value ?? '0')
  return { raw, formatted: value ?? '0' }
}

// WHY (Z18): the whole proposal lifecycle AND terminal outcome are delegated to
// the SDK's audited derivation — the PENDING→ACTIVE transition, a stale subgraph
// PENDING/ACTIVE past the deadline resolving to the vote outcome (never EXPIRED),
// OZ GovernorCountingSimple strict-majority ties, and >2^53-wei precision. This
// is the ONE source of truth the explorer list (getProposalState) and the detail
// badges (getProposalStateAtom) share, so they can't disagree at any boundary.
// Register keeps only UI deadlines + display percentages. `currentTimepoint` is
// the proposal's native unit: unix seconds for Anastasius, block for Alexios.
const deriveState = (
  proposal: Partial<ProposalDetail>,
  currentTimepoint: number
): string =>
  getYieldDtfProposalState(
    {
      state: proposal.state ?? PROPOSAL_STATES.PENDING,
      voteStart: Number(proposal.startBlock ?? 0),
      voteEnd: Number(proposal.endBlock ?? 0),
      forWeightedVotes: weiAmount(proposal.forWeightedVotes),
      againstWeightedVotes: weiAmount(proposal.againstWeightedVotes),
      abstainWeightedVotes: weiAmount(proposal.abstainWeightedVotes),
      quorumVotes: weiAmount(proposal.quorumVotes),
    } as Parameters<typeof getYieldDtfProposalState>[0],
    currentTimepoint
  )

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

    // State is the SDK's authoritative lifecycle derivation; the branches below
    // only compute the UI countdown for the states that have one.
    state.state = deriveState(proposal, timeunit)

    // TODO: Guardian can cancel on the QUEUED state!
    if (proposal.state === PROPOSAL_STATES.QUEUED && proposal.executionETA) {
      state.deadline = proposal.executionETA - timestamp
    } else if (state.state === PROPOSAL_STATES.PENDING) {
      state.deadline = isTimeunit
        ? proposal.startBlock - timestamp
        : (proposal.startBlock - blockNumber) * BLOCK_DURATION
    } else if (state.state === PROPOSAL_STATES.ACTIVE) {
      state.deadline = isTimeunit
        ? proposal.endBlock - timestamp
        : (proposal.endBlock - blockNumber) * BLOCK_DURATION
    }

    const totalVotes =
      +proposal.forWeightedVotes +
      +proposal.againstWeightedVotes +
      +proposal.abstainWeightedVotes
    state.quorum =
      !!Number(proposal.forWeightedVotes) &&
      +proposal.forWeightedVotes >= +proposal.quorumVotes

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

    // State is the SDK's authoritative lifecycle derivation; the branches below
    // only compute the UI countdown for the states that have one.
    state.state = deriveState(proposal, timeunit)

    // TODO: Guardian can cancel on the QUEUED state!
    if (proposal.state === PROPOSAL_STATES.QUEUED && proposal.executionETA) {
      state.deadline = proposal.executionETA - timestamp
    } else if (state.state === PROPOSAL_STATES.PENDING) {
      state.deadline = isTimeunit
        ? proposal.startBlock - timestamp
        : (proposal.startBlock - blockNumber) * BLOCK_DURATION
    } else if (state.state === PROPOSAL_STATES.ACTIVE) {
      state.deadline = isTimeunit
        ? proposal.endBlock - timestamp
        : (proposal.endBlock - blockNumber) * BLOCK_DURATION
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
