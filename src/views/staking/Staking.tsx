import { Box, Grid } from 'theme-ui'
import StakeContainer from './components/StakeContainer'
import Overview from './components/overview'
import Withdraw from './components/withdraw'

const Staking = () => (
  <Box variant="layout.tokenView">
    <Grid columns={[1, 1, 1, '1.4fr 1fr', '1fr 480px']} gap={[0, 0, 0, 4, 5]}>
      <Box
        pr={[0, 0, 0, 4]}
        sx={{
          borderRight: ['none', 'none', 'none', '1px solid'],
          borderColor: ['border', 'border', 'border', 'border'],
        }}
      >
        <StakeContainer />
        <Withdraw mt={5} mb={4} />
      </Box>
      <Overview />
    </Grid>
  </Box>
)

export default Staking
