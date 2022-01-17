import { Card, Container } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import TransactionsTable from 'components/transactions/table'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { Box, Text, Grid } from '@theme-ui/components'
import AssetsOverview from './components/assets'
import UsageOverview from './components/usage'
import { useEthers } from '@usedapp/core'
import RSV from 'constants/rsv'
import ContentHeader from 'components/layout/content-header'

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const RToken = useSelector(selectCurrentRToken)
  const { chainId } = useEthers()

  // TODO: Skeleton
  if (!RToken) {
    return (
      <Container pt={4} pb={4}>
        <Card>Loading ReserveToken...</Card>
      </Container>
    )
  }

  const isRSV = RToken.id === RSV[chainId ?? 1].id

  return (
    <Container pb={4}>
      <ContentHeader />
      <Grid columns={2} gap={5} width={600}>
        <Box>
          <UsageOverview data={RToken} />
          <AssetsOverview data={RToken} isRSV={isRSV} />
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
