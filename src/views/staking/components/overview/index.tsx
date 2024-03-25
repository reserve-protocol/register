import { Box, BoxProps } from 'theme-ui'
import About from './About'
import StakingMetrics from './StakingMetrics'
import UnstakeDelayOverview from './UnstakeDelayOverview'
import StakeApy from './StakeApy'

const Overview = (props: BoxProps) => (
  <Box {...props}>
    <StakingMetrics />
    <StakeApy />

    <UnstakeDelayOverview />
    <About mt={[3, 4]} />
  </Box>
)

export default Overview
