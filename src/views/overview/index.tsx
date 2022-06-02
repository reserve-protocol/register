import { Box, Grid, Text } from 'theme-ui'
import { Card, Container } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import TransactionsTable from 'components/transactions/table'
import { useAtomValue } from 'jotai/utils'
import { rTokenAtom } from 'state/atoms'
import AssetsOverview from './components/token-assets'
import UsageOverview from './components/usage'

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const RToken = useAtomValue(rTokenAtom)

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
      <Grid columns={[1, 1, 1, 2]} gap={[3, 3, 4, 5]}>
        <Box>
          <UsageOverview data={RToken} mb={3} />
          <AssetsOverview data={RToken} mb={3} />
          <Text variant="sectionTitle" mb={2}>
            Transactions
          </Text>
          <Card>
            <TransactionsTable tokenId={RToken.address} />
          </Card>
        </Box>
        <Box>
          <PriceChart token={RToken} mb={3} />
          <MarketCapChart token={RToken} mb={2} />
        </Box>
      </Grid>
    </Container>
  )
}

export default Overview
