import { Box, Card, Grid } from 'theme-ui'
import Navigation from './components/Navigation'
import SectionWrapper from './components/SectionWrapper'
import Summary from './components/Summary'

const Proposal = () => {
  return (
    <Card sx={{ overflow: 'auto' }}>
      <SectionWrapper navigationIndex={0}>
        <Box sx={{ height: 1000, backgroundColor: 'black' }}>Section 1</Box>
      </SectionWrapper>
      <SectionWrapper navigationIndex={1}>
        <Box sx={{ height: 1000, backgroundColor: 'red' }}>Section 2</Box>
      </SectionWrapper>
      <SectionWrapper navigationIndex={2}>
        <Box>Section 3</Box>
      </SectionWrapper>
    </Card>
  )
}

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
