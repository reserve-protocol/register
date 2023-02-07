import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import IconInfo from 'components/info-icon'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Divider, Grid, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ROUTES } from 'utils/constants'
import AccountVotes from './AccountVotes'

const query = gql`
  query getGovernanceStats($id: String!) {
    governance(id: $id) {
      id
      totalTokenSupply
      totalTokenHolders
      totalDelegates
      proposals
      governanceFrameworks {
        name
      }
    }
  }
`

// TODO: Governance data casting?
const useStats = () => {
  const rToken = useRToken()
  const response = useQuery(rToken?.address && !rToken.isRSV ? query : null, {
    id: rToken?.address.toLowerCase(),
  })

  return useMemo(() => {
    const { data } = response

    return {
      governanceFrameworks: data?.governance?.governanceFrameworks ?? [],
      proposals: +data?.governance?.proposals || 0,
      totalTokenSupply: +formatEther(data?.governance?.totalTokenSupply ?? '0'),
      totalTokenHolders: +formatEther(
        data?.governance?.totalTokenHolders ?? '0'
      ),
      totalDelegates: data?.governance?.totalDelegates ?? '0',
    }
  }, [JSON.stringify(response)])
}

// TODO: Validate if account is above proposal threshold
const GovernanceOverview = () => {
  const stats = useStats()
  const navigate = useNavigate()
  const rToken = useRToken()
  const governance = (stats?.governanceFrameworks || [])[0]

  return (
    <Box>
      <AccountVotes />
      <Box variant="layout.borderBox" p={0}>
        <Grid gap={0} columns={2}>
          <Box
            p={4}
            sx={{
              borderRight: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'border',
            }}
          >
            <Text variant="subtitle" mb={3}>
              <Trans>Proposals</Trans>
            </Text>
            <IconInfo
              icon={<Image src="/svgs/asterisk.svg" />}
              title={t`All time`}
              text={formatCurrency(stats.proposals)}
            />
          </Box>
          <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
            <Text variant="subtitle" mb={3}>
              <Trans>Vote Supply</Trans>
            </Text>
            <IconInfo
              icon={<Image src="/svgs/asterisk.svg" />}
              title={t`Current`}
              text={formatCurrency(stats.totalTokenSupply)}
            />
          </Box>
          <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
            <Text variant="subtitle" mb={3}>
              <Trans>Voting Addresses</Trans>
            </Text>
            <IconInfo
              icon={<Image src="/svgs/asterisk.svg" />}
              title={t`Current`}
              text={formatCurrency(stats.totalDelegates)}
            />
          </Box>
        </Grid>
      </Box>
      <Box mt={4} variant="layout.borderBox">
        <Text variant="subtitle">
          <Trans>Format</Trans>
        </Text>
        <Text variant="title">{governance ? governance.name : 'Custom'}</Text>
        <Text as="p" variant="legend" mt={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus
          facilisis velit, at venenatis nunc iaculis vitae vestibulum ante
          ipsum. facilisis velit, at venenatis nunc iaculis.
        </Text>
        <Divider mx={-4} my={4} />
        <Box variant="layout.verticalAlign">
          <Image mr={2} src="/svgs/asterisk.svg" />
          <Text variant="strong">
            <Trans>Roles & Actions</Trans>
          </Text>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() =>
              navigate(`${ROUTES.SETTINGS}?token=${rToken?.address}`)
            }
          >
            <Trans>View settings</Trans>
          </SmallButton>
        </Box>
        <Box mt={4} variant="layout.verticalAlign">
          <Image mr={2} src="/svgs/asterisk.svg" />
          <Text variant="strong">
            <Trans>Proposals</Trans>
          </Text>
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() =>
              navigate(`${ROUTES.GOVERNANCE_PROPOSAL}?token=${rToken?.address}`)
            }
          >
            <Trans>Create proposal</Trans>
          </SmallButton>
        </Box>
      </Box>
    </Box>
  )
}

export default GovernanceOverview
