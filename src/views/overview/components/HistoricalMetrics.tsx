import { Box, Card, Text } from 'theme-ui'
import PriceChart from './charts/PriceChart'
import SupplyChart from './charts/SupplyChart'
import StakingChart from './charts/StakingChart'
import EarnIcon from 'components/icons/EarnIcon'
import { Trans } from '@lingui/macro'
import { TrendingUp } from 'react-feather'

const HistoricalMetrics = () => {
  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        ml="4"
        mb={3}
        mt={6}
        sx={{ color: 'accent' }}
      >
        <TrendingUp />
        <Text ml="3" as="h2" variant="heading">
          <Trans>Historical metrics</Trans>
        </Text>
      </Box>
      <Card mt="5">
        <PriceChart />
        <SupplyChart mt="5" />
        <StakingChart mt="5" />
      </Card>
    </Box>
  )
}

export default HistoricalMetrics
