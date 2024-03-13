import { Box } from 'theme-ui'
import ExchangeRate from '../ExchangeRate'
import InputOutputSeparator from '../InputOutputSeparator'
import StakeButton from './StakeButton'
import StakeInput from './StakeInput'
import StakeOutput from './StakeOutput'

const Stake = () => (
  <Box p={4}>
    <StakeInput />
    <InputOutputSeparator />
    <StakeOutput />
    <ExchangeRate />
    <StakeButton />
  </Box>
)

export default Stake
