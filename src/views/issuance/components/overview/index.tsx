import { useEthers, useTokenBalance } from '@usedapp/core'
import { Card } from 'components'
import MarketCapChart from 'components/charts/marketcap-chart'
import PriceChart from 'components/charts/price-chart'
import InfoBox from 'components/info-box'
import TransactionsTable from 'components/transactions/table'
import { utils } from 'ethers'
import { IReserveToken } from 'state/reserve-tokens/reducer'
import { Box, Flex, Grid, Text } from 'theme-ui'

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = ({ data }: { data: IReserveToken }) => {
  const { account } = useEthers()
  const { rToken } = data
  const balance = useTokenBalance(rToken.address, account)

  return (
    <Flex
      sx={{
        flexWrap: 'wrap',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexGrow: 9999, flexBasis: 0, minWidth: 620 }}>
        <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
          Usage
        </Text>
        <Grid columns={3} mb={3}>
          <Card>
            <InfoBox title="2,102,123" subtitle="Total Transactions" />
          </Card>
          <Card>
            <InfoBox
              title="3,241,231"
              description="$3,241,231"
              subtitle="24h Volume"
            />
          </Card>
          <Card>
            <InfoBox title="243,123" subtitle="Holders" />
          </Card>
        </Grid>
        <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
          Assets
        </Text>
        <Card p={4}>
          <InfoBox
            title={`${balance ? utils.formatEther(balance) : '0.0'} ${
              rToken.symbol
            }`}
            subtitle="In circulation"
          />
        </Card>
        <Grid columns={3} gap={0} mb={3}>
          <Card>
            <InfoBox title="0.00" subtitle="USDT" />
          </Card>
          <Card>
            <InfoBox title="0.00" subtitle="USDC" />
          </Card>
          <Card>
            <InfoBox title="0.00" subtitle="TUSD" />
          </Card>
        </Grid>
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
  )
}

export default Overview
