import { Box, Grid, Text } from '@theme-ui/components'
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
      <Grid columns={2} gap={[3, 3, 4, 5]} width={[400, 500, 400]}>
        <Box>
          <UsageOverview data={RToken} mb={3} />
          <AssetsOverview data={RToken} mb={3} />
          <Text variant="sectionTitle" mb={2}>
            Transactions
          </Text>
          <Card>
            <TransactionsTable tokenId={RToken.token.address} />
          </Card>
        </Box>
        <Box>
          <PriceChart token={RToken.token} mb={3} />
          <MarketCapChart token={RToken.token} mb={2} />
        </Box>
      </Grid>
    </Container>
  )
}

export default Overview
