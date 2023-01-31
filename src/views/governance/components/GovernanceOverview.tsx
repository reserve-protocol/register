import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { Box, Grid, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

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
      totalDelegates: +formatEther(data?.governance?.totalDelegates ?? '0'),
    }
  }, [JSON.stringify(response)])
}

const GovernanceOverview = () => {
  const stats = useStats()
  const validGovernance = !!stats.governanceFrameworks.length

  return (
    <Box>
      <Box variant="layout.borderBox" mb={4}>
        <Text variant="legend">
          <Trans>Proposals</Trans>
        </Text>
      </Box>
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
        <Text sx={{ fontSize: 4 }}></Text>
      </Box>
    </Box>
  )
}

export default GovernanceOverview
