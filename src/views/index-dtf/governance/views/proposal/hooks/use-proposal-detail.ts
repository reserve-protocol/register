import { ProposalDetail } from '@/lib/governance'
import { recentProposalsAtom } from '@/views/index-dtf/governance/atoms'
import { getRecentProposalKey } from '@/views/index-dtf/governance/utils/recent-proposals'
import {
  isSdkError,
  useIndexDtfIdentity,
  useIndexDtfProposal,
  type IndexDtfProposalDetail,
  type IndexDtfProposalVotingSnapshot,
  useIndexDtfProposalVotingSnapshot,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { PROPOSAL_STATES } from '@/utils/constants'

const MAX_REFETCH_INTERVAL = 60_000
const ACTIVE_REFETCH_INTERVAL = 30_000

export enum ProposalStatus {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

const withVotingSnapshot = (
  proposal: IndexDtfProposalDetail,
  votingSnapshot: IndexDtfProposalVotingSnapshot | undefined
): IndexDtfProposalDetail => {
  if (!votingSnapshot) return proposal

  const shouldKeepDetailThreshold =
    proposal.isOptimistic &&
    !!proposal.optimistic &&
    votingSnapshot.votes.length === 0

  return {
    ...proposal,
    state: votingSnapshot.state,
    voteStart: votingSnapshot.voteStart,
    voteEnd: votingSnapshot.voteEnd,
    quorumVotes: shouldKeepDetailThreshold
      ? proposal.quorumVotes
      : votingSnapshot.quorumVotes,
    forWeightedVotes: votingSnapshot.forWeightedVotes,
    againstWeightedVotes: votingSnapshot.againstWeightedVotes,
    abstainWeightedVotes: votingSnapshot.abstainWeightedVotes,
    votes: votingSnapshot.votes,
    votingState: shouldKeepDetailThreshold
      ? {
          ...votingSnapshot.votingState,
          threshold: proposal.votingState.threshold,
        }
      : votingSnapshot.votingState,
    ...(votingSnapshot.isOptimistic === undefined
      ? {}
      : { isOptimistic: votingSnapshot.isOptimistic }),
    ...(shouldKeepDetailThreshold
      ? { vetoThreshold: proposal.vetoThreshold }
      : votingSnapshot.vetoThreshold === undefined
        ? {}
        : { vetoThreshold: votingSnapshot.vetoThreshold }),
    ...(shouldKeepDetailThreshold
      ? { optimistic: proposal.optimistic }
      : votingSnapshot.optimistic
        ? { optimistic: votingSnapshot.optimistic }
        : {}),
  }
}

const mapProposalDetail = (
  proposal: IndexDtfProposalDetail
): ProposalDetail => {
  const proposalDetail: ProposalDetail = {
    id: proposal.id,
    chainId: proposal.chainId,
    timelockId: proposal.timelockId,
    description: proposal.description,
    creationTime: proposal.creationTime,
    creationBlock: proposal.creationBlock,
    state: proposal.votingState.state,
    forWeightedVotes: proposal.forWeightedVotes,
    abstainWeightedVotes: proposal.abstainWeightedVotes,
    againstWeightedVotes: proposal.againstWeightedVotes,
    quorumVotes: proposal.quorumVotes,
    voteStart: proposal.voteStart,
    voteEnd: proposal.voteEnd,
    executionETA: proposal.executionETA,
    executionTime: proposal.executionTime?.toString(),
    executionBlock: proposal.executionBlock?.toString(),
    isOptimistic: proposal.isOptimistic,
    vetoThreshold: proposal.vetoThreshold,
    optimistic: proposal.optimistic,
    wasChallenged: proposal.wasChallenged,
    challengedProposalId: proposal.challengedProposalId,
    voteToken: proposal.voteToken,
    timelock: proposal.timelock,
    proposer: {
      address: proposal.proposer,
    },
    calldatas: [...proposal.calldatas],
    targets: [...proposal.targets],
    votes: proposal.votes.map((vote) => ({
      choice: vote.choice,
      voter: vote.voter,
      weight: vote.weight,
    })),
    queueBlock: proposal.queueBlock,
    queueTime: proposal.queueTime?.toString(),
    cancellationTime: proposal.cancellationTime?.toString(),
    forDelegateVotes: proposal.forDelegateVotes.toString(),
    abstainDelegateVotes: proposal.abstainDelegateVotes.toString(),
    againstDelegateVotes: proposal.againstDelegateVotes.toString(),
    executionTxnHash: proposal.executionTxnHash,
    governor: proposal.governance,
    votingState: proposal.votingState,
    decoded: proposal.decoded,
  }

  return proposalDetail
}

const useProposalDetail = (proposalId: string | undefined) => {
  const { address, chainId } = useIndexDtfIdentity()
  const recentProposals = useAtomValue(recentProposalsAtom)
  const proposalQuery = useIndexDtfProposal(
    proposalId ? { address, chainId, proposalId } : undefined,
    {
      refetchInterval: (query) =>
        getRefetchInterval(
          query.state.data as IndexDtfProposalDetail | undefined
        ),
    }
  )
  const recentProposal = useMemo(() => {
    if (!proposalId) return undefined

    return recentProposals[
      getRecentProposalKey({ chainId, dtf: address, proposalId })
    ]?.detail
  }, [address, chainId, proposalId, recentProposals])
  const shouldUseRecentProposal =
    !proposalQuery.data &&
    !!recentProposal &&
    isSdkError(proposalQuery.error) &&
    proposalQuery.error.code === 'RECORD_NOT_FOUND'
  const proposal =
    proposalQuery.data ?? (shouldUseRecentProposal ? recentProposal : undefined)
  const shouldReadVotingSnapshot =
    !shouldUseRecentProposal &&
    proposal?.votingState.state === PROPOSAL_STATES.ACTIVE
  const votingSnapshotQuery = useIndexDtfProposalVotingSnapshot(
    shouldReadVotingSnapshot && proposal
      ? { chainId, proposalId: proposal.id }
      : undefined,
    {
      refetchInterval: (query) =>
        getRefetchInterval(
          query.state.data as IndexDtfProposalVotingSnapshot | undefined
        ),
    }
  )
  const data = useMemo(() => {
    if (!proposal) {
      return undefined
    }

    return mapProposalDetail(
      withVotingSnapshot(proposal, votingSnapshotQuery.data)
    )
  }, [proposal, votingSnapshotQuery.data])

  return {
    ...proposalQuery,
    data,
    error: shouldUseRecentProposal
      ? votingSnapshotQuery.error
      : (proposalQuery.error ?? votingSnapshotQuery.error),
    isError: shouldUseRecentProposal
      ? votingSnapshotQuery.isError
      : proposalQuery.isError || votingSnapshotQuery.isError,
    isFetching: proposalQuery.isFetching || votingSnapshotQuery.isFetching,
  }
}

function getRefetchInterval(
  proposal: Pick<IndexDtfProposalDetail, 'votingState'> | undefined
) {
  if (!proposal) return MAX_REFETCH_INTERVAL

  const deadline = proposal.votingState.deadline
  if (deadline && deadline > 0) {
    return Math.min(deadline * 1000 + 1000, MAX_REFETCH_INTERVAL)
  }

  if (proposal.votingState.state === PROPOSAL_STATES.ACTIVE) {
    return ACTIVE_REFETCH_INTERVAL
  }

  return MAX_REFETCH_INTERVAL
}

export default useProposalDetail
