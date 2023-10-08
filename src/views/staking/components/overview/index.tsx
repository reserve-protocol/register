import { Box, BoxProps } from 'theme-ui'
import About from './About'
import BridgeInfo from './BridgeInfo'
import ExchangeRate from './ExchangeRate'
import StakingStats from './StakingStats'

const Overview = (props: BoxProps) => (
  <Box {...props}>
    <BridgeInfo />
    <ExchangeRate mt={[3, 4]} />
    <StakingStats mt={[3, 4]} />
    <About mt={[3, 4]} />
  </Box>
)

export default Overview
