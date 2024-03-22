import { Box, Grid } from 'theme-ui'
import StakeContainer from './components/StakeContainer'
import Overview from './components/overview'
import Withdraw from './components/withdraw'
import StakePosition from './components/StakePosition'

const Staking = () => (
  <Box variant="layout.tokenView">
    <Grid columns={[1, 1, 1, '1.2fr 1fr', '1fr 480px']} gap={[0, 0, 0, 4, 5]}>
      <Box
        pr={[0, 0, 0, 4]}
        sx={{
          borderRight: ['none', 'none', 'none', '1px solid'],
          borderColor: ['border', 'border', 'border', 'border'],
        }}
      >
        <StakeContainer />
        <StakePosition mt={5} />
        <Withdraw my={4} />
      </Box>
      <Overview />
    </Grid>
  </Box>
)

export default Staking
