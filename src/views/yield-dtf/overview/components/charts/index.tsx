import APYChart from './apy-chart'
import PriceChart from './price-chart'
import StakingChart from './staking-chart'
import SupplyChart from './supply-chart'

const HistoricalCharts = () => {
  return (
    <div className="flex flex-col gap-1">
      <PriceChart className="bg-card rounded-3xl p-3" />
      <APYChart className="bg-card rounded-3xl p-3" />
      <SupplyChart className="bg-card rounded-3xl p-3" />
      <StakingChart className="bg-card rounded-3xl p-3" />
    </div>
  )
}

export default HistoricalCharts
