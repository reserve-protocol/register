import APYChart from './APYChart'
import PriceChart from './PriceChart'
import StakingChart from './StakingChart'
import SupplyChart from './SupplyChart'

const HistoricalCharts = () => {
  return (
    <div className="flex flex-col gap-1">
      <PriceChart />
      <APYChart />
      <SupplyChart />
      <StakingChart />
    </div>
  )
}

export default HistoricalCharts
