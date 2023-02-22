import MDEditor from '@uiw/react-md-editor'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Card, Grid, Spinner } from 'theme-ui'
import { Proposal } from 'types'
import ProposalDetail from 'views/governance/components/ProposalDetail'
import ProposalVote from './components/ProposalVote'

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

  if (proposal?.proposer?.address) {
    proposal.proposer = proposal.proposer.address
  }

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
      <Box>
        <Card p={4} mb={4}>
          {loading && <Spinner size={24} />}
          {proposal?.description && (
            <MDEditor.Markdown
              source={proposal.description}
              style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
            />
          )}
        </Card>
        {!!proposal && (
          <ProposalDetail
            addresses={proposal.targets}
            calldatas={proposal.calldatas}
          />
        )}
      </Box>
      <Box>
        <ProposalVote proposal={proposal as Proposal} />
      </Box>
    </Grid>
  )
}

export default GovernanceProposalDetail
