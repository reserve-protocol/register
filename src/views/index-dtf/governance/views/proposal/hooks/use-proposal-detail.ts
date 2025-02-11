import { getProposalState, ProposalDetail } from '@/lib/governance'
import { chainIdAtom, INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { Address, formatEther, Hex } from 'viem'

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
    }
  }
}

const query = gql`
  query getProposalDetail($id: String!) {
    proposal(id: $id) {
      id
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
      }
    }
  }
`

const useProposalDetail = (proposalId: string | undefined) => {
  const chainId = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      if (!proposalId) {
        return undefined
      }

      const { proposal } = await request<Result>(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        query,
        {
          id: proposalId,
        }
      )

      const proposalDetail: ProposalDetail = {
        ...proposal,
        id: proposal.id,
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
}

export default useProposalDetail
