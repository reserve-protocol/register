import { Box, BoxProps, Grid } from 'theme-ui'
import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'

const Governance = (props: BoxProps) => {
  return (
    <Grid
      id="rtoken-setup-container"
      columns={['1fr', '1fr 1fr', '1.5fr 1fr', '1fr 400px']}
      gap={5}
      px={[4, 7]}
      pt={[4, 6]}
      sx={{
        height: '100%',
        position: 'relative',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        overflowY: 'auto',
      }}
      {...props}
    >
      <Box>
        <ProposalList />
        <TopVoters mt={5} />
      </Box>

      <GovernanceActions />
    </Grid>
  )
}

export default Governance
