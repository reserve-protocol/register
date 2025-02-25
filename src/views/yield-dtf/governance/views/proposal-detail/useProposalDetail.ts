import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { ProposalDetail } from './atom'

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

const query = gql`
  query getProposalDetail($id: String!) {
    proposal(id: $id) {
      id
      description
      creationTime
      startBlock
      endBlock
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
      governanceFramework {
        contractAddress
        name
      }
    }
  }
`

const useProposalDetail = (
  id: string
): { data: ProposalDetail | null; error: boolean; loading: boolean } => {
  const { data, error } = useQuery(id ? query : null, {
    id,
  })

  return useMemo(() => {
    const proposal = data?.proposal
      ? {
          ...data.proposal,
          votes: (data.proposal.votes || []).map((data: any) => ({
            choice: data.choice,
            voter: data.voter?.address ?? '',
            weight: data.weight ? formatEther(data.weight) : '0',
          })),
          proposer: data.proposal.proposer?.address ?? '',
          startBlock: +data.proposal.startBlock,
          endBlock: +data.proposal.endBlock,
          queueBlock: data.proposal.queueBlock
            ? +data.proposal.queueBlock
            : undefined,
          executionETA: data.proposal.executionETA
            ? +data.proposal.executionETA
            : undefined,
          forWeightedVotes: formatEther(data.proposal.forWeightedVotes || '0'),
          againstWeightedVotes: formatEther(
            data.proposal.againstWeightedVotes || '0'
          ),
          abstainWeightedVotes: formatEther(
            data.proposal.abstainWeightedVotes || '0'
          ),
          executionTxnHash: data.proposal.executionTxnHash || '',
          quorumVotes: formatEther(data.proposal.quorumVotes || '0'),
          governor: data.proposal.governanceFramework.contractAddress,
          version: data.proposal.governanceFramework.name,
          creationBlock: +data.proposal.creationBlock,
        }
      : null

    return {
      data: proposal,
      error: !!error,
      loading: !data?.proposal && !error,
    }
  }, [data, error])
}

export default useProposalDetail
