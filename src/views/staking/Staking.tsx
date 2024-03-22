import { Box, Grid } from 'theme-ui'
import StakeContainer from './components/StakeContainer'
import Overview from './components/overview'
import Withdraw from './components/withdraw'

const Staking = () => (
  <Box variant="layout.tokenView">
    <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[3, 5]}>
      <Box>
        <StakeContainer />
        <Withdraw mt={5} mb={4} />
      </Box>
      <Overview />
    </Grid>
  </Box>
)

export default Staking
