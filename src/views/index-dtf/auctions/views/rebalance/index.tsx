import RebalanceAction from './components/rebalance-action'
import RebalanceDebug from './components/rebalance-debug'
import RebalanceHeader from './components/rebalance-header'
import RebalanceSetup from './components/rebalance-setup'
import Updater from './updater'

const Rebalance = () => (
  <>
    <div className="bg-secondary p-1 rounded-4xl w-[480px] flex flex-col gap-1 border-2 border-background">
      <div className="bg-background/70 rounded-3xl">
        <RebalanceHeader />
        <RebalanceSetup />
      </div>
      <RebalanceAction />
      <RebalanceDebug />
    </div>
    <Updater />
  </>
)

export default Rebalance
