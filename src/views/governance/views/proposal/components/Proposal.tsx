import { Grid } from 'theme-ui'
import ProposalForm from './ProposalForm'
import ProposalOverview from './ProposalOverview'

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
