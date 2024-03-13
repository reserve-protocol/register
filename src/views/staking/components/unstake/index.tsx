import { Box } from 'theme-ui'
import UnstakeInput from './UnstakeInput'
import InputOutputSeparator from '../InputOutputSeparator'
import UnstakeOutput from './UnstakeOutput'
import UnstakeButton from './UnstakeButton'
import ExchangeRate from '../ExchangeRate'

const Unstake = () => {
  return (
    <Box p={4}>
      <UnstakeInput />
      <InputOutputSeparator />
      <UnstakeOutput />
      <ExchangeRate />
      <UnstakeButton />
    </Box>
  )
}

export default Unstake
