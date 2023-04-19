import { Container } from 'components'
import { Box, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'
import Zap from './components/zap'

/**
 * Mint & Redeem view
 */
const Issuance = () => (
  <Container pb={4}>
    <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[3, 5]}>
      <Box>
        <Zap />
        <Grid columns={[1, 2]} gap={4} mb={4}>
          <Issue />
          <Redeem />
        </Grid>
        <Balances />
      </Box>
      <About />
    </Grid>
  </Container>
)

export default Issuance
