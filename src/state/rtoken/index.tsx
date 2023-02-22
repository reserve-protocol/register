import TokenUpdater from './RTokenUpdater'
import StateUpdater from './RTokenStateUpdater'
import SetupUpdater from './RTokenSetupUpdater'
import RTokenBasketUpdater from './RTokenBasketUpdater'
import RTokenGovernanceUpdater from './RTokenGovernanceUpdater'

const Updater = () => (
  <>
    <TokenUpdater />
    <StateUpdater />
    <SetupUpdater />
    <RTokenBasketUpdater />
    <RTokenGovernanceUpdater />
  </>
)

export default Updater
