import { Box } from 'theme-ui'
import InputOutputSeparator from '../InputOutputSeparator'
import ActionOverview from './ActionOverview'
import UnstakeButton from './UnstakeButton'
import UnstakeInput from './UnstakeInput'
import UnstakeOutput from './UnstakeOutput'

const Unstake = () => {
  return (
    <Box p={4}>
      <UnstakeInput />
      <InputOutputSeparator />
      <UnstakeOutput />
      <ActionOverview />
      <UnstakeButton />
    </Box>
  )
}

export default Unstake
