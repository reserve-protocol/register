import PriceChart from './PriceChart'
import StakingChart from './StakingChart'
import SupplyChart from './SupplyChart'

const HistoricalCharts = () => {
  return (
    <>
      <PriceChart />
      <SupplyChart mt="5" />
      <StakingChart mt="5" />
    </>
  )
}

export default HistoricalCharts
