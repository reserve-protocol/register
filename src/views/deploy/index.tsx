import { Button, Container } from 'components'
import { atom, useAtom } from 'jotai'
import { Box, Grid } from 'theme-ui'
import BackingForm from './components/BackingForm'
import StakingToken from './components/StakingToken'
import TokenForm from './components/TokenForm'

const Deploy = () => {
  return (
    <Container sx={{ maxWidth: 1024, margin: 'auto' }}>
      <Grid gap={5} columns={[1, 2]}>
        <Box>
          <TokenForm mb={4} />
          <BackingForm />
        </Box>
        <Box>
          <StakingToken />
        </Box>
      </Grid>
    </Container>
  )
}

export default Deploy
