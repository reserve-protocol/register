import { Box, BoxProps, Divider, Grid } from 'theme-ui'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'

const Governance = (props: BoxProps) => (
  <Box variant="layout.wrapper">
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
        <ProposalList />
        <TopVoters mt={4} mb={[0, 0, 4]} />
      </Box>
      <GovernanceActions />
    </Grid>
  </Box>
)

export default Governance
