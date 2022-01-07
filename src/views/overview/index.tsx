import { Card, Container } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import TransactionsTable from 'components/transactions/table'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { Box, Flex, Text, Grid } from '@theme-ui/components'
import AssetsOverview from './components/assets'
import UsageOverview from './components/usage'

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
    return <Box>Loading...</Box>
  }

  return (
    <Container pt={4} pb={4}>
      <Grid columns={2} gap={5} width={600}>
        <Box>
          <UsageOverview data={RToken} />
          <AssetsOverview data={RToken} />
          <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
            Transactions
          </Text>
          <Card>
            <TransactionsTable />
          </Card>
        </Box>
        <Box>
          <PriceChart mb={5} />
          <MarketCapChart mb={5} />
        </Box>
      </Grid>
    </Container>
  )
}

export default Overview
