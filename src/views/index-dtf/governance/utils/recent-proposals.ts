import DTFIndexGovernance from '@/abis/dtf-index-governance'
import type { IndexDTF } from '@/types'
import { getCurrentTime } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import type {
  Amount,
  DtfSdk,
  IndexDtfProposalDecoded,
  IndexDtfProposalDetail,
  IndexDtfProposalDtfContractContext,
  IndexDtfProposalGovernanceContractContext,
  IndexDtfProposalSummary,
  ProposalVotingState,
  SupportedChainId,
} from '@reserve-protocol/react-sdk'
import {
  getAddress,
  isAddressEqual,
  parseEventLogs,
  parseEther,
  type Address,
  type Hex,
  type TransactionReceipt,
} from 'viem'

const ZERO_AMOUNT: Amount = { raw: 0n, formatted: '0' }

export type ProposalCreatedEventData = {
  proposalId: string
  proposer: Address
  governor: Address
  targets: Address[]
  values: bigint[]
  signatures: string[]
  calldatas: Hex[]
  description: string
  voteStart: number
  voteEnd: number
  transactionHash: Hex
  creationBlock: number
  creationTime: number
}

export type RecentProposalData = {
  detail: IndexDtfProposalDetail
  event: ProposalCreatedEventData
  addedAt: number
}

export type RecentProposalsMap = Record<string, RecentProposalData>

type ProposalCreatedLogArgs = {
  proposalId?: bigint
  proposer?: Address
  targets?: Address[]
  values?: bigint[]
  signatures?: string[]
  calldatas?: Hex[]
  voteStart?: bigint
  voteEnd?: bigint
  description?: string
}

type ResolvedProposalGovernance = {
  governance: NonNullable<IndexDTF['ownerGovernance']>
  voteToken: Address
  proposalGovernance: IndexDtfProposalGovernanceContractContext
}

export const getRecentProposalKey = ({
  chainId,
  dtf,
  proposalId,
}: {
  chainId: number
  dtf: Address | string
  proposalId: string
}) => `${chainId}:${dtf.toLowerCase()}:${proposalId}`

export const parseProposalCreatedFromReceipt = (
  receipt: TransactionReceipt,
  governor: Address
): Omit<ProposalCreatedEventData, 'creationTime'> | undefined => {
  const normalizedGovernor = getAddress(governor)
  const logs = parseEventLogs({
    abi: DTFIndexGovernance,
    logs: receipt.logs,
    eventName: 'ProposalCreated',
  })

  const proposalLog = logs.find((log) =>
    isAddressEqual(getAddress(log.address), normalizedGovernor)
  )

  if (!proposalLog) return undefined

  const args = proposalLog.args as ProposalCreatedLogArgs

  if (
    args.proposalId === undefined ||
    !args.proposer ||
    !args.targets ||
    !args.values ||
    !args.signatures ||
    !args.calldatas ||
    args.voteStart === undefined ||
    args.voteEnd === undefined ||
    args.description === undefined
  ) {
    return undefined
  }

  return {
    proposalId: args.proposalId.toString(),
    proposer: getAddress(args.proposer),
    governor: normalizedGovernor,
    targets: args.targets.map((target) => getAddress(target)),
    values: [...args.values],
    signatures: [...args.signatures],
    calldatas: [...args.calldatas],
    description: args.description,
    voteStart: Number(args.voteStart),
    voteEnd: Number(args.voteEnd),
    transactionHash: receipt.transactionHash,
    creationBlock: Number(receipt.blockNumber),
  }
}

export const buildRecentProposalFromReceipt = async ({
  receipt,
  governor,
  dtf,
  chainId,
  sdk,
}: {
  receipt: TransactionReceipt
  governor: Address
  dtf: IndexDTF
  chainId: SupportedChainId
  sdk: DtfSdk
}): Promise<{ key: string; proposal: RecentProposalData }> => {
  const parsed = parseProposalCreatedFromReceipt(receipt, governor)
  if (!parsed) throw new Error('ProposalCreated event not found')

  const governance = resolveProposalGovernance(dtf, parsed.governor)
  const dtfContext = getDtfContractContext(dtf)
  if (!governance || !dtfContext) {
    throw new Error('Unable to resolve proposal governance context')
  }

  const creationTime = getCurrentTime()
  const event: ProposalCreatedEventData = { ...parsed, creationTime }
  const decoded = await decodeProposal({
    sdk,
    chainId,
    targets: event.targets,
    calldatas: event.calldatas,
    dtf: dtfContext,
    proposalGovernance: governance.proposalGovernance,
  })
  const votingState = getRecentProposalVotingState(
    event.voteStart,
    event.voteEnd
  )
  const isOptimistic = isOptimisticProposal(
    governance.governance,
    event.proposer
  )
  const vetoThreshold = getOptimisticVetoThreshold(governance.governance)

  const detail: IndexDtfProposalDetail = {
    id: event.proposalId,
    txnHash: event.transactionHash,
    chainId,
    governance: event.governor,
    timelock: governance.governance.timelock.id,
    voteToken: governance.voteToken,
    dtf: { address: dtf.id, chainId },
    proposer: event.proposer,
    description: event.description,
    state: votingState.state,
    creationTime,
    creationBlock: event.creationBlock,
    voteStart: event.voteStart,
    voteEnd: event.voteEnd,
    quorumVotes: ZERO_AMOUNT,
    forWeightedVotes: ZERO_AMOUNT,
    againstWeightedVotes: ZERO_AMOUNT,
    abstainWeightedVotes: ZERO_AMOUNT,
    isOptimistic,
    ...(isOptimistic && vetoThreshold !== undefined ? { vetoThreshold } : {}),
    votingState,
    targets: event.targets,
    calldatas: event.calldatas,
    votes: [],
    forDelegateVotes: 0,
    againstDelegateVotes: 0,
    abstainDelegateVotes: 0,
    decoded,
  }

  return {
    key: getRecentProposalKey({
      chainId,
      dtf: dtf.id,
      proposalId: event.proposalId,
    }),
    proposal: {
      detail,
      event,
      addedAt: getCurrentTime(),
    },
  }
}

const isOptimisticProposal = (
  governance: ResolvedProposalGovernance['governance'],
  proposer: Address
) => {
  if (!governance.isOptimistic) return false

  const optimisticProposers = [
    ...(governance.optimistic?.proposers ?? []),
    ...governance.timelock.optimisticProposers,
  ]

  return optimisticProposers.some((candidate) =>
    isAddressEqual(candidate, proposer)
  )
}

const getOptimisticVetoThreshold = (
  governance: ResolvedProposalGovernance['governance']
) => {
  const vetoThreshold = governance.optimistic?.vetoThreshold

  if (vetoThreshold === undefined) return undefined

  return parseEther((vetoThreshold / 100).toFixed(18))
}

export const mergeRecentProposals = ({
  subgraphProposals,
  proposalCount,
  recentProposals,
  chainId,
  dtf,
}: {
  subgraphProposals: readonly IndexDtfProposalSummary[] | undefined
  proposalCount: number | undefined
  recentProposals: RecentProposalsMap
  chainId: number
  dtf: Address | string | undefined
}) => {
  const recent = getRecentProposalsForDtf(recentProposals, chainId, dtf)

  if (!subgraphProposals && recent.length === 0) {
    return { proposals: undefined, proposalCount: undefined }
  }

  const indexedIds = new Set(
    (subgraphProposals ?? []).map((proposal) => proposal.id)
  )
  const recentNotIndexed = recent
    .filter((proposal) => !indexedIds.has(proposal.detail.id))
    .sort((left, right) => right.detail.creationTime - left.detail.creationTime)
  const proposals = [
    ...recentNotIndexed.map((proposal) => proposal.detail),
    ...(subgraphProposals ?? []),
  ]

  return {
    proposals,
    proposalCount:
      proposalCount === undefined
        ? proposals.length
        : proposalCount + recentNotIndexed.length,
  }
}

export const getRecentProposalsForDtf = (
  recentProposals: RecentProposalsMap,
  chainId: number,
  dtf: Address | string | undefined
) => {
  if (!dtf) return []

  const prefix = `${chainId}:${dtf.toLowerCase()}:`
  return Object.entries(recentProposals)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, proposal]) => getUpdatedRecentProposal(proposal))
}

export const getUpdatedRecentProposalDetail = (
  proposal: IndexDtfProposalDetail
): IndexDtfProposalDetail => {
  const votingState = getRecentProposalVotingState(
    proposal.voteStart,
    proposal.voteEnd
  )

  return {
    ...proposal,
    state: votingState.state,
    votingState,
  }
}

const getUpdatedRecentProposal = (
  proposal: RecentProposalData
): RecentProposalData => ({
  ...proposal,
  detail: getUpdatedRecentProposalDetail(proposal.detail),
})

const resolveProposalGovernance = (
  dtf: IndexDTF,
  governor: Address
): ResolvedProposalGovernance | undefined => {
  const voteToken = dtf.stToken?.id
  if (!voteToken) return undefined

  const governance = [
    dtf.ownerGovernance,
    dtf.tradingGovernance,
    dtf.stToken?.governance,
  ].find(
    (candidate): candidate is NonNullable<IndexDTF['ownerGovernance']> =>
      !!candidate && isAddressEqual(candidate.id, governor)
  )

  if (!governance) return undefined

  return {
    governance,
    voteToken,
    proposalGovernance: {
      address: governance.id,
      timelock: {
        address: governance.timelock.id,
        type: governance.timelock.type,
      },
    },
  }
}

const getDtfContractContext = (
  dtf: IndexDTF
): IndexDtfProposalDtfContractContext | undefined => {
  if (!dtf.stToken) return undefined

  return {
    address: dtf.id,
    proxyAdmin: dtf.proxyAdmin,
    legacyAdminGovernance: dtf.legacyAdmins,
    legacyTradingGovernance: dtf.legacyAuctionApprovers,
    ...(dtf.ownerGovernance
      ? {
          ownerGovernance: {
            address: dtf.ownerGovernance.id,
            timelock: dtf.ownerGovernance.timelock.id,
          },
        }
      : {}),
    ...(dtf.tradingGovernance
      ? {
          tradingGovernance: {
            address: dtf.tradingGovernance.id,
            timelock: dtf.tradingGovernance.timelock.id,
          },
        }
      : {}),
    stakingToken: {
      address: dtf.stToken.id,
      legacyGovernance: dtf.stToken.legacyGovernance,
      ...(dtf.stToken.governance
        ? {
            governance: {
              address: dtf.stToken.governance.id,
              timelock: dtf.stToken.governance.timelock.id,
            },
          }
        : {}),
    },
  }
}

const decodeProposal = async ({
  sdk,
  chainId,
  targets,
  calldatas,
  dtf,
  proposalGovernance,
}: {
  sdk: DtfSdk
  chainId: SupportedChainId
  targets: Address[]
  calldatas: Hex[]
  dtf: IndexDtfProposalDtfContractContext
  proposalGovernance: IndexDtfProposalGovernanceContractContext
}) => {
  try {
    return await sdk.index.decodeProposalCalldatas({
      chainId,
      targets,
      calldatas,
      dtf,
      proposalGovernance,
    })
  } catch {
    return getUnknownDecodedProposal(targets, calldatas)
  }
}

const getUnknownDecodedProposal = (
  targets: Address[],
  calldatas: Hex[]
): IndexDtfProposalDecoded => {
  const unknownCalls = targets.map((target, index) => ({
    index,
    target,
    contract: 'Unknown',
    callData: calldatas[index]!,
  }))
  const unknownContracts = unknownCalls.map((call) => ({
    target: call.target,
    contract: call.contract,
    calls: [call],
  }))

  return {
    contracts: {},
    dataByContract: [],
    unknownContracts,
    calls: [],
    unknownCalls,
  }
}

const getRecentProposalVotingState = (
  voteStart: number,
  voteEnd: number
): ProposalVotingState => {
  const now = getCurrentTime()
  const state =
    now >= voteStart ? PROPOSAL_STATES.ACTIVE : PROPOSAL_STATES.PENDING
  const deadline =
    state === PROPOSAL_STATES.PENDING
      ? Math.max(voteStart - now, 0)
      : state === PROPOSAL_STATES.ACTIVE
        ? Math.max(voteEnd - now, 0)
        : null

  return {
    state,
    deadline,
    quorum: false,
    forVotesReachedQuorum: false,
    participationQuorumReached: false,
    vetoReached: false,
    threshold: {
      currentVotes: ZERO_AMOUNT,
      progress: 0,
      reached: false,
      hasTarget: false,
    },
    for: 0,
    against: 0,
    abstain: 0,
  }
}
