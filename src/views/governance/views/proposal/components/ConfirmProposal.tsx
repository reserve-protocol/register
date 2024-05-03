import { Container, Grid } from 'theme-ui'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'
import SimulateProposal from './SimulateProposal'

const ConfirmProposal = () => {
  const tx = useProposalTx()

  // TODO: Loading state
  if (!tx) {
    return null
  }

  return (
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
      <ConfirmProposalForm addresses={tx.args[0]} calldatas={tx.args[2]} />
      <Container variant="layout.sticky">
        <ConfirmProposalOverview tx={tx} />
        <SimulateProposal mt="4" tx={tx} />
      </Container>
    </Grid>
  )
}

export default ConfirmProposal
