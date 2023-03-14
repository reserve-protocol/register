import { Trans } from '@lingui/macro'
import MDEditor from '@uiw/react-md-editor'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Divider, Grid, Text } from 'theme-ui'
import { Proposal } from 'types'
import { shortenAddress } from 'utils'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'
import ProposalVote from './components/ProposalVote'
import dayjs from 'dayjs'
import GoTo from 'components/button/GoTo'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { SmallButton } from 'components/button'
import { ArrowLeft } from 'react-feather'
import useRToken from 'hooks/useRToken'
import { ROUTES } from 'utils/constants'
import useProposalDetail from './useProposalDetail'

const GovernanceProposalDetail = () => {
  const { proposalId } = useParams()
  const rToken = useRToken()
  const { data: proposal, loading } = useProposalDetail(proposalId ?? '')
  const navigate = useNavigate()

  let title = 'Loading...'
  let description = ''

  if (proposal?.description) {
    const [heading, ...content] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    description = content.join('\n')
  }

  const handleBack = () => {
    navigate(`${ROUTES.GOVERNANCE}?token=${rToken?.address}`)
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
        <Box variant="layout.verticalAlign" mb={4}>
          <SmallButton variant="muted" onClick={handleBack}>
            <Box variant="layout.verticalAlign">
              <ArrowLeft size={14} style={{ marginRight: 10 }} />
              <Trans>Back</Trans>
            </Box>
          </SmallButton>
        </Box>

        <Card p={4} mb={4}>
          <Text variant="title" mb={2}>
            {title}
          </Text>
          <Box variant="layout.verticalAlign" sx={{ fontSize: 1 }}>
            <Text variant="legend" mr={1}>
              <Trans>Proposed by</Trans>:
            </Text>
            <Text>
              {proposal?.proposer
                ? shortenAddress(proposal.proposer)
                : 'Loading...'}
            </Text>
            {!!proposal?.proposer && (
              <GoTo
                ml={1}
                href={getExplorerLink(
                  proposal.proposer,
                  ExplorerDataType.ADDRESS
                )}
              />
            )}

            <Text variant="legend" ml={3} mr={1}>
              <Trans>Proposed on</Trans>:
            </Text>
            <Text>
              {proposal?.creationTime
                ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
                : 'Loading...'}
            </Text>
          </Box>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <MDEditor.Markdown
            source={description}
            style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
          />
        </Card>
        {!!proposal && (
          <ProposalDetail
            addresses={proposal.targets}
            calldatas={proposal.calldatas}
          />
        )}
      </Box>
      <Box>
        <ProposalVote />
      </Box>
    </Grid>
  )
}

export default GovernanceProposalDetail
