import dtfIndexGovernance from '@/abis/dtf-index-governance'
import reserveOptimisticGovernorAbi from '@/abis/reserve-optimistic-governor'
import {
  getOnchainProposalState,
  getProposalState,
  ProposalDetail,
} from '@/lib/governance'
import { chainIdAtom, INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, formatEther, Hex } from 'viem'
import { usePublicClient, useReadContract } from 'wagmi'

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

type Result = {
  proposal: {
    id: string
    timelockId: string
    description: string
    creationTime: string
    voteStart: string
    voteEnd: string
    queueBlock?: string
    queueTime?: string
    state: string
    executionETA?: string
    executionTime?: string
    creationBlock: string
    cancellationTime?: string
    calldatas: Hex[]
    targets: Address[]
    proposer: {
      address: Address
    }
    votes: {
      choice: string
      voter: {
        address: string
      }
      weight: string
    }[]
    forWeightedVotes: string
    againstWeightedVotes: string
    abstainWeightedVotes: string
    quorumVotes: string
    forDelegateVotes: string
    abstainDelegateVotes: string
    againstDelegateVotes: string
    executionTxnHash?: string
    governance: {
      id: string
      token?: {
        token: {
          address: Address
        }
      }
    }
  }
}

const proposalDetailQuery = gql`
  query getProposalDetail($id: String!) {
    proposal(id: $id) {
      id
      timelockId
      description
      creationTime
      voteStart
      voteEnd
      queueBlock
      queueTime
      state
      executionETA
      executionTime
      creationBlock
      cancellationTime
      calldatas
      targets
      proposer {
        address
      }
      votes {
        choice
        voter {
          address
        }
        weight
      }
      forWeightedVotes
      againstWeightedVotes
      abstainWeightedVotes
      quorumVotes
      forDelegateVotes
      abstainDelegateVotes
      againstDelegateVotes
      executionTxnHash
      governance {
        id
        token {
          token {
            address
          }
        }
      }
    }
  }
`

const useProposalDetail = (proposalId: string | undefined) => {
  const chainId = useAtomValue(chainIdAtom)
  const publicClient = usePublicClient({ chainId })

  const proposalDetailQueryResult = useQuery({
    queryKey: ['proposal', chainId, proposalId],
    queryFn: async () => {
      if (!proposalId) {
        return undefined
      }

      const { proposal } = await request<Result>(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        proposalDetailQuery,
        {
          id: proposalId,
        }
      )

      const proposalDetail: ProposalDetail = {
        ...proposal,
        id: proposal.id,
        timelockId: proposal.timelockId,
        description: proposal.description,
        creationTime: +proposal.creationTime,
        creationBlock: +proposal.creationBlock,
        votes: (proposal.votes || []).map((data: any) => ({
          choice: data.choice,
          voter: data.voter?.address ?? '',
          weight: data.weight ? formatEther(data.weight) : '0',
        })),
        voteStart: +proposal.voteStart,
        voteEnd: +proposal.voteEnd,
        queueBlock: proposal.queueBlock ? +proposal.queueBlock : undefined,
        executionETA: proposal.executionETA
          ? +proposal.executionETA
          : undefined,
        forWeightedVotes: +formatEther(BigInt(proposal.forWeightedVotes)),
        againstWeightedVotes: +formatEther(
          BigInt(proposal.againstWeightedVotes)
        ),
        abstainWeightedVotes: +formatEther(
          BigInt(proposal.abstainWeightedVotes)
        ),
        quorumVotes: +formatEther(BigInt(proposal.quorumVotes)),
        governor: proposal.governance.id as Address,
        voteToken: proposal.governance.token?.token.address as
          | Address
          | undefined,
        votingState: {
          state: proposal.state,
          deadline: null,
          quorum: false,
          for: 0,
          against: 0,
          abstain: 0,
        },
      }
      proposalDetail.votingState = getProposalState(proposalDetail)
      proposalDetail.state = proposalDetail.votingState.state

      return proposalDetail
    },
  })

  const { data: onchainProposalState } = useReadContract({
    address: proposalDetailQueryResult.data?.governor,
    abi: dtfIndexGovernance,
    functionName: 'state',
    args: [BigInt(proposalId || '0')],
    chainId,
    query: {
      enabled: !!proposalDetailQueryResult.data?.governor && !!proposalId,
    },
  })

  const { data: isOptimistic } = useQuery({
    queryKey: [
      'proposal-is-optimistic',
      chainId,
      proposalId,
      proposalDetailQueryResult.data?.governor,
    ],
    queryFn: async () => {
      if (!publicClient || !proposalDetailQueryResult.data?.governor || !proposalId) {
        return undefined
      }

      try {
        return await publicClient.readContract({
          address: proposalDetailQueryResult.data.governor,
          abi: reserveOptimisticGovernorAbi,
          functionName: 'isOptimistic',
          args: [BigInt(proposalId)],
        })
      } catch {
        return false
      }
    },
    enabled:
      !!publicClient && !!proposalDetailQueryResult.data?.governor && !!proposalId,
  })

  const data = useMemo(() => {
    if (!proposalDetailQueryResult.data) {
      return proposalDetailQueryResult.data
    }

    const proposalDetail = {
      ...proposalDetailQueryResult.data,
      isOptimistic,
    }

    if (onchainProposalState === undefined) {
      return proposalDetail
    }

    const state = getOnchainProposalState(onchainProposalState)

    if (!state || state === proposalDetail.state) {
      return proposalDetail
    }

    const votingState = getProposalState({ ...proposalDetail, state })

    return {
      ...proposalDetail,
      state,
      votingState: {
        ...votingState,
        state,
      },
    }
  }, [proposalDetailQueryResult.data, onchainProposalState, isOptimistic])

  return {
    ...proposalDetailQueryResult,
    data,
  }
}

export default useProposalDetail
