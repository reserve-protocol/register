import { Box, BoxProps } from 'theme-ui'
import About from './About'
import StakingMetrics from './StakingMetrics'
import UnstakeDelayOverview from './UnstakeDelayOverview'

const Overview = (props: BoxProps) => (
  <Box {...props}>
    <StakingMetrics />
    <UnstakeDelayOverview />
    <About mt={[3, 4]} />
  </Box>
)

export default Overview
