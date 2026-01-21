import { Box, Grid } from 'theme-ui'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'

const Governance = () => (
  <Box variant="layout.tokenView">
    <Grid
      columns={[1, 1, 1, '2fr 1.5fr']}
      gap={[3, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <Box>
        <ProposalList />
        <TopVoters className="mt-6 mb-0 lg:mb-6" />
      </Box>
      <GovernanceActions />
    </Grid>
  </Box>
)

export default Governance
