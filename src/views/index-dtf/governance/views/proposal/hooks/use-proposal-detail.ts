import { ProposalDetail } from '@/lib/governance'
import {
  getProposalState,
  useIndexDtfIdentity,
  useIndexDtfOptimisticProposalContext,
  useIndexDtfProposal,
  type IndexDtfOptimisticProposalContext,
  type IndexDtfProposalDetail,
} from '@reserve-protocol/react-sdk'
import { useMemo } from 'react'
import { Address } from 'viem'

const OPTIMISTIC_CONTEXT_MISSING_ERROR = new Error(
  'Optimistic proposal context is required for optimistic proposal detail'
)

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

const mapProposalDetail = (
  proposal: IndexDtfProposalDetail,
  optimistic?: IndexDtfOptimisticProposalContext | null
): ProposalDetail => {
  const optimisticContext = optimistic ?? undefined
  const votingState = optimisticContext
    ? getProposalState({ ...proposal, optimistic: optimisticContext })
    : proposal.votingState
  const proposalDetail: ProposalDetail = {
    id: proposal.id,
    timelockId: proposal.timelockId ?? '',
    description: proposal.description,
    creationTime: proposal.creationTime,
    creationBlock: proposal.creationBlock,
    state: votingState.state,
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
    optimistic: optimisticContext,
    wasChallenged: proposal.wasChallenged,
    challengedProposalId: proposal.challengedProposalId,
    voteToken: proposal.voteToken,
    proposer: {
      address: proposal.proposer as Address,
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
    votingState,
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
  const shouldReadOptimisticContext = proposal?.isOptimistic === true
  const optimisticContextQuery = useIndexDtfOptimisticProposalContext(
    shouldReadOptimisticContext
      ? {
          chainId,
          governance: proposal.governance,
          proposalId: proposal.id,
          isOptimistic: true,
        }
      : undefined,
    { refetchInterval: 1000 * 60 }
  )
  const isOptimisticContextPending =
    shouldReadOptimisticContext && optimisticContextQuery.isPending
  const isOptimisticContextError =
    shouldReadOptimisticContext && optimisticContextQuery.isError
  const isOptimisticContextMissing =
    shouldReadOptimisticContext &&
    optimisticContextQuery.isSuccess &&
    !optimisticContextQuery.data
  const optimisticContextError = isOptimisticContextMissing
    ? OPTIMISTIC_CONTEXT_MISSING_ERROR
    : optimisticContextQuery.error
  const data = useMemo(() => {
    if (
      !proposal ||
      isOptimisticContextPending ||
      isOptimisticContextError ||
      isOptimisticContextMissing
    ) {
      return undefined
    }

    return mapProposalDetail(proposal, optimisticContextQuery.data)
  }, [
    proposal,
    optimisticContextQuery.data,
    isOptimisticContextPending,
    isOptimisticContextError,
    isOptimisticContextMissing,
  ])

  return {
    ...proposalQuery,
    data,
    error: proposalQuery.error ?? optimisticContextError,
    isError:
      proposalQuery.isError ||
      isOptimisticContextError ||
      isOptimisticContextMissing,
    isFetching: proposalQuery.isFetching || optimisticContextQuery.isFetching,
    isLoading: proposalQuery.isLoading || isOptimisticContextPending,
    isPending: proposalQuery.isPending || isOptimisticContextPending,
    isSuccess:
      proposalQuery.isSuccess &&
      !isOptimisticContextPending &&
      !isOptimisticContextError &&
      !isOptimisticContextMissing,
    status:
      isOptimisticContextError || isOptimisticContextMissing
        ? 'error'
        : isOptimisticContextPending
          ? 'pending'
          : proposalQuery.status,
  }
}

export default useProposalDetail
