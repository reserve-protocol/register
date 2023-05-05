import { Container } from 'components'
import { Box, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'

/**
 * Mint & Redeem view
 */
const IssuanceFallback = () => {
  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[3, 5]}>
        <Box>
          <Grid columns={[1, 2]} gap={4} mb={4}>
            <Issue />
            <Redeem />
          </Grid>
          <Balances />
        </Box>
        <Box>
          <IssuanceInfo mb={4} />
          <About />
        </Box>
      </Grid>
    </Container>
  )
}

export default IssuanceFallback
