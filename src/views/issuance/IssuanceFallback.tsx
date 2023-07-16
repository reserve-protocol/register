import { Container } from 'components'
import { Box, Grid } from 'theme-ui'
import About from './components/about'
import BalancesFallback from './components/balances/BalancesFallback'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'

/**
 * Mint & Redeem view
 */
const IssuanceFallback = () => {
  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
        <Box>
          <Grid columns={[1, 2]} gap={[1, 4]} mb={[1, 4]}>
            <Issue />
            <Redeem />
          </Grid>
          <BalancesFallback />
        </Box>
        <Box>
          <IssuanceInfo mb={[1, 4]} />
          <About />
        </Box>
      </Grid>
    </Container>
  )
}

export default IssuanceFallback
