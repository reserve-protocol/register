import useRToken from 'hooks/useRToken'
import { BoxProps, Card } from 'theme-ui'
import StakingChart from './StakingChart'
import PriceChart from './PriceChart'
import SupplyChart from './SupplyChart'

const HistoricalData = (props: BoxProps) => {
  const rToken = useRToken()

  return (
    <Card {...props} p={5}>
      <PriceChart mb={5} />
      <SupplyChart />
      {!rToken?.isRSV && <StakingChart mt={5} />}
    </Card>
  )
}

export default HistoricalData
