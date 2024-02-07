import Layout from 'components/rtoken-setup/Layout'
import ProposalForm from './ProposalForm'
import ProposalNavigation from './ProposalNavigation'
import ProposalOverview from './ProposalOverview'
import { Grid } from 'theme-ui'

const Proposal = () => (
  <Grid
    columns={['1fr', '1fr', '1.5fr 1fr']}
    gap={5}
    p={[1, 6]}
    sx={{
      position: 'relative',
      justifyContent: 'center',
      alignContent: 'flex-start',
      alignItems: 'flex-start',
    }}
  >
    <ProposalForm />
    <ProposalOverview />
  </Grid>
)

export default Proposal
