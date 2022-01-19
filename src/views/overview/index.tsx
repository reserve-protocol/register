import { Card, Container } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import TransactionsTable from 'components/transactions/table'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { Box, Text, Grid } from '@theme-ui/components'
import ContentHeader from 'components/layout/content-header'
import UsageOverview from './components/usage'
import AssetsOverview from './components/assets'

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const RToken = useSelector(selectCurrentRToken)

  // TODO: Skeleton
  if (!RToken) {
    return (
      <Container>
        <Card>Loading ReserveToken...</Card>
      </Container>
    )
  }

  return (
    <Container>
      <ContentHeader />
      <Grid columns={2} gap={[3, 3, 4, 5]} width={[400, 500, 400]}>
        <Box>
          <UsageOverview data={RToken} mb={3} />
          <AssetsOverview data={RToken} mb={3} />
          <Text variant="sectionTitle" mb={2}>
            Transactions
          </Text>
          <Card>
            <TransactionsTable />
          </Card>
        </Box>
        <Box>
          <PriceChart mb={3} />
          <MarketCapChart mb={2} />
        </Box>
      </Grid>
    </Container>
  )
}

export default Overview
