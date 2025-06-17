import RebalanceAction from './components/rebalance-action'
import RebalanceAuctions from './components/rebalance-auctions'
import RebalanceHeader from './components/rebalance-header'
import RebalanceMetrics from './components/rebalance-metrics'
import RebalanceSetup from './components/rebalance-setup'
import Updater from './updater'

const Rebalance = () => (
  <>
    <div className="bg-secondary p-1 rounded-4xl w-[480px] flex flex-col gap-1">
      <div className="bg-background/70  rounded-3xl">
        <RebalanceHeader />
        <RebalanceSetup />
      </div>
      <RebalanceAction />
      <RebalanceAuctions />
      <RebalanceMetrics />
    </div>
    <Updater />
  </>
)

export default Rebalance
