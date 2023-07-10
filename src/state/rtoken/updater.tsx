import StateUpdater from './updaters/RTokenStateUpdater'
import RTokenGovernanceUpdater from './updaters/RTokenGovernanceUpdater'

const Updater = () => (
  <>
    <StateUpdater />
    <RTokenGovernanceUpdater />
  </>
)

export default Updater
