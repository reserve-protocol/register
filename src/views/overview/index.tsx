import { Card, Container } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import TransactionsTable from 'components/transactions/table'
import { useSelector } from 'react-redux'
import {
  IReserveToken,
  selectCurrentRToken,
} from 'state/reserve-tokens/reducer'
import { Box, Flex, Text } from 'theme-ui'
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
      <Flex
        sx={{
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexGrow: 9999, flexBasis: 0, minWidth: 620 }}>
          <UsageOverview data={RToken} />
          <AssetsOverview data={RToken} />
          <PriceChart mb={3} />
          <MarketCapChart mb={3} />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 600,
            marginBottom: 3,
            marginLeft: 4,
            '@media screen and (max-width: 1616px)': {
              marginLeft: 0,
              marginBottom: 0,
            },
          }}
        >
          <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
            Transactions
          </Text>
          <Card>
            <TransactionsTable />
          </Card>
        </Box>
      </Flex>
    </Container>
  )
}

export default Overview
