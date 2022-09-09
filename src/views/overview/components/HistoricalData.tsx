import useRToken from 'hooks/useRToken'
import { BoxProps, Card } from 'theme-ui'
import InsuranceChart from './InsuranceChart'
import PriceChart from './PriceChart'
import SupplyChart from './SupplyChart'

const HistoricalData = (props: BoxProps) => {
  const rToken = useRToken()

  return (
    <Card {...props} p={5}>
      <PriceChart mb={5} />
      <SupplyChart />
      {!rToken?.isRSV && <InsuranceChart mt={5} />}
    </Card>
  )
}

export default HistoricalData
