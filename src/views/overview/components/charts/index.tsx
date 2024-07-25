import APYChart from './APYChart'
import PriceChart from './PriceChart'
import StakingChart from './StakingChart'
import SupplyChart from './SupplyChart'

const HistoricalCharts = () => {
  return (
    <>
      <PriceChart />
      <APYChart mt="5" />
      <SupplyChart mt="5" />
      <StakingChart mt="5" />
    </>
  )
}

export default HistoricalCharts
