import { Box } from 'theme-ui'
import InputOutputSeparator from '../InputOutputSeparator'
import ActionOverview from './ActionOverview'
import StakeButton from './StakeButton'
import StakeInput from './StakeInput'
import StakeOutput from './StakeOutput'

const Stake = () => (
  <Box p={4}>
    <StakeInput />
    <InputOutputSeparator />
    <StakeOutput />
    <ActionOverview />
    <StakeButton />
  </Box>
)

export default Stake
