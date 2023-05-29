import TokenUpdater from './RTokenUpdater'
import StateUpdater from './RTokenStateUpdater'
import RTokenBasketUpdater from './RTokenBasketUpdater'
import RTokenGovernanceUpdater from './RTokenGovernanceUpdater'

const Updater = () => (
  <>
    <TokenUpdater />
    <StateUpdater />
    <RTokenBasketUpdater />
    <RTokenGovernanceUpdater />
  </>
)

export default Updater
