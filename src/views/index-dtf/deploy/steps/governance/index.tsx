import NextButton from '../../components/next-button'
import Ticker from '../../utils/ticker'
import GovernanceOptions from './governance-options'

const Description = () => {
  return (
    <div className="px-6 pb-6 text-base">
      Please enter the address of the wallet or contract that will govern{' '}
      <Ticker />. The Reserve Index Protocol can support both one-person rule
      and DAO governance. Be aware, that having centralized control limits who
      can interact with <Ticker /> on Register.
    </div>
  )
}

const Governance = () => {
  return (
    <>
      <Description />
      <GovernanceOptions />
      <NextButton />
    </>
  )
}

export default Governance
