import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { ProposalDetail } from './atom'

const query = gql`
  query getProposal($id: String!) {
    proposal(id: $id) {
      id
      description
      creationTime
      state
      calldatas
      targets
      proposer {
        address
      }
    }
  }
`

const useProposalDetail = (
  id: string
): { data: ProposalDetail | null; error: boolean; loading: boolean } => {
  const response = useQuery(id ? query : null, {
    id,
  })

  return useMemo(() => {
    const { data, error } = response

    const proposal = data?.proposal ?? null
    if (proposal?.proposer) {
      proposal.proposer = proposal.proposer.address
    }

    return {
      data: proposal,
      error: !!error,
      loading: !data?.proposal && !error,
    }
  }, [response])
}

export default useProposalDetail
