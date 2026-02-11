import InputOutputSeparator from '../input-output-separator'
import ActionOverview from './action-overview'
import UnstakeButton from './unstake-button'
import UnstakeInput from './unstake-input'
import UnstakeOutput from './unstake-output'

const Unstake = () => {
  return (
    <div className="p-4">
      <UnstakeInput />
      <InputOutputSeparator />
      <UnstakeOutput />
      <ActionOverview />
      <UnstakeButton />
    </div>
  )
}

export default Unstake
