import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Grid, Spinner } from 'theme-ui'
import ProposalDetail from 'views/governance/components/ProposalDetail'

const query = gql`
  query getProposal($id: String!) {
    proposal(id: $id) {
      id
      description
      creationTime
      state
      calldatas
      targets
    }
  }
`

const useProposal = (id: string) => {
  const response = useQuery(id ? query : null, {
    id,
  })

  return useMemo(() => {
    const { data, error } = response

    return {
      data: data?.proposal ?? null,
      error: !!error,
      loading: !data?.proposal && !error,
    }
  }, [response])
}

const GovernanceProposalDetail = () => {
  const { proposalId } = useParams()
  const { data: proposal, loading } = useProposal(proposalId ?? '')

  console.log('proposal', loading)

  return (
    <Grid
      columns={[1, 1, 1, '2fr 1.5fr']}
      gap={[3, 5]}
      padding={[1, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
    >
      {loading && <Spinner />}
      {!!proposal && (
        <ProposalDetail
          addresses={proposal.targets}
          calldatas={proposal.calldatas}
        />
      )}
    </Grid>
  )
}

export default GovernanceProposalDetail
