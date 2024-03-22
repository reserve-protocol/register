import { Box, BoxProps } from 'theme-ui'
import About from './About'
import BridgeInfo from './BridgeInfo'
import ExchangeRate from './ExchangeRate'
import StakingStats from './StakingStats'
import StakingMetrics from './StakingMetrics'

const Overview = (props: BoxProps) => (
  <Box {...props}>
    {/* <BridgeInfo /> */}
    {/* <ExchangeRate /> */}
    {/* <StakingStats mt={[3, 4]} /> */}
    <StakingMetrics />
    <About mt={[3, 4]} />
  </Box>
)

export default Overview
