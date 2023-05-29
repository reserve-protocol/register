import StateUpdater from './RTokenStateUpdater'
import RTokenBasketUpdater from './RTokenBasketUpdater'
import RTokenGovernanceUpdater from './RTokenGovernanceUpdater'

const Updater = () => (
  <>
    <StateUpdater />
    <RTokenBasketUpdater />
    <RTokenGovernanceUpdater />
  </>
)

export default Updater
