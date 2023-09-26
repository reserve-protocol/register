import { Box, BoxProps, Divider, Grid } from 'theme-ui'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'
import UpgradeHelper from './views/proposal/components/UpgradeHelper'
import useRToken from 'hooks/useRToken'

const Governance = (props: BoxProps) => {
  const rToken = useRToken()
  const upgradeableRTokens = [
    '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
  ]

  return (
    <Grid
      columns={[1, 1, '2fr 1.5fr']}
      gap={[3, 5]}
      padding={[1, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
      }}
      {...props}
    >
      <Box>
        {upgradeableRTokens.includes(rToken?.address || '') && (
          <UpgradeHelper mb={3} />
        )}
        <ProposalList />
        <TopVoters mt={4} mb={[0, 0, 4]} />
      </Box>
      <GovernanceActions />
    </Grid>
  )
}

export default Governance
