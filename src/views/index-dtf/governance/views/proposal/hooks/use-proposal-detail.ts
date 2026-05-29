import { ProposalDetail } from '@/lib/governance'
import {
  useIndexDtfIdentity,
  useIndexDtfProposal,
  type IndexDtfProposalDetail,
  type IndexDtfProposalVotingSnapshot,
  useIndexDtfProposalVotingSnapshot,
} from '@reserve-protocol/react-sdk'
import { useMemo } from 'react'
import { PROPOSAL_STATES } from '@/utils/constants'

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

  return {
    ...proposal,
    state: votingSnapshot.state,
    voteStart: votingSnapshot.voteStart,
    voteEnd: votingSnapshot.voteEnd,
    quorumVotes: votingSnapshot.quorumVotes,
    forWeightedVotes: votingSnapshot.forWeightedVotes,
    againstWeightedVotes: votingSnapshot.againstWeightedVotes,
    abstainWeightedVotes: votingSnapshot.abstainWeightedVotes,
    votes: votingSnapshot.votes,
    votingState: votingSnapshot.votingState,
    ...(votingSnapshot.isOptimistic === undefined
      ? {}
      : { isOptimistic: votingSnapshot.isOptimistic }),
    ...(votingSnapshot.vetoThreshold === undefined
      ? {}
      : { vetoThreshold: votingSnapshot.vetoThreshold }),
    ...(votingSnapshot.optimistic
      ? { optimistic: votingSnapshot.optimistic }
      : {}),
  }
}

const mapProposalDetail = (proposal: IndexDtfProposalDetail): ProposalDetail => {
  const proposalDetail: ProposalDetail = {
    id: proposal.id,
    timelockId: proposal.timelockId ?? '',
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
  }

  return proposalDetail
}

const useProposalDetail = (proposalId: string | undefined) => {
  const { address, chainId } = useIndexDtfIdentity()
  const proposalQuery = useIndexDtfProposal(
    proposalId ? { address, chainId, proposalId } : undefined,
    { refetchInterval: 1000 * 60 }
  )
  const proposal = proposalQuery.data
  const shouldReadVotingSnapshot =
    proposal?.votingState.state === PROPOSAL_STATES.ACTIVE
  const votingSnapshotQuery = useIndexDtfProposalVotingSnapshot(
    shouldReadVotingSnapshot && proposal
      ? { chainId, proposalId: proposal.id }
      : undefined,
    { refetchInterval: 30_000 }
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
    error: proposalQuery.error ?? votingSnapshotQuery.error,
    isError: proposalQuery.isError || votingSnapshotQuery.isError,
    isFetching: proposalQuery.isFetching || votingSnapshotQuery.isFetching,
  }
}

export default useProposalDetail
