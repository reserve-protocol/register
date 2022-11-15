import { Box, Card, Grid } from 'theme-ui'
import Navigation from './components/Navigation'
import Proposal from './components/Proposal'
import SectionWrapper from './components/SectionWrapper'
import Summary from './components/Summary'

const Governance = () => {
  return (
    <Grid
      columns={['1fr', '1fr 1fr', '1fr 1fr', 'auto 1fr 420px']}
      gap={4}
      padding={[4, 5]}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        alignContent: 'flex-start',
      }}
    >
      <Navigation
        sx={{
          display: ['none', 'none', 'none', 'inherit'],
        }}
      />
      <Proposal />
      <Summary />
    </Grid>
  )
}

export default Governance
