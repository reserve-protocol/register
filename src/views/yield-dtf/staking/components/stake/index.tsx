import InputOutputSeparator from '../input-output-separator'
import ActionOverview from './action-overview'
import StakeButton from './stake-button'
import StakeInput from './stake-input'
import StakeOutput from './stake-output'

const Stake = () => (
  <div className="p-4">
    <StakeInput />
    <InputOutputSeparator />
    <StakeOutput />
    <ActionOverview />
    <StakeButton />
  </div>
)

export default Stake
