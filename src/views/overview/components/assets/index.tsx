import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { Card } from 'components'
import InfoBox from 'components/info-box'
import Separator from 'components/separator'
import { formatEther } from 'ethers/lib/utils'
import useTokenSupply from 'hooks/useTokenSupply'
import { useEffect, useState } from 'react'
import { Pie, PieChart } from 'recharts'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

const data02 = [
  {
    name: 'Group A',
    value: 2400,
  },
  {
    name: 'Group B',
    value: 4567,
  },
  {
    name: 'Group C',
    value: 1398,
  },
  {
    name: 'Group D',
    value: 9800,
  },
  {
    name: 'Group E',
    value: 3908,
  },
  {
    name: 'Group F',
    value: 4800,
  },
]
const mock = [{ name: 'test', value: 'holi' }]

const AssetsChart = () => {
  console.log('works?')
  return (
    <Box p={2}>
      <PieChart width={100} height={100}>
        <Pie
          data={data02}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={38}
          outerRadius={50}
          fill="#82ca9d"
        />
      </PieChart>
    </Box>
  )
}

/**
 * RToken Assets overview
 * Display the market cap of the current RToken and the ratio between the RToken and their vault collaterals
 *
 * @prop data: ReserveToken
 * @returns React.Component
 */
const AssetsOverview = ({
  data: { isRSV, token, vault },
  ...props
}: {
  data: ReserveToken
}) => {
  // TODO: For RTokens consult this from the explorer view contract
  // TODO: More than the expected basket tokens could be returned
  const [collaterals, setCollaterals] = useState(
    vault.collaterals.map((collateral) => ({
      name: collateral.token.name,
      decimals: collateral.token.decimals,
      symbol: collateral.token.symbol,
      index: collateral.index,
      address: collateral.token.address,
      value: '0.00',
    }))
  )
  const marketCap = useTokenSupply(token.address)

  useEffect(() => {
    if (marketCap) {
      if (isRSV) {
        const distribution = formatCurrency(
          parseFloat(formatEther(marketCap.div(3)))
        )
        setCollaterals(
          collaterals.map((collateral) => ({
            ...collateral,
            value: distribution,
          }))
        )
      }
    }
  }, [marketCap])

  return (
    <Box mb={3} {...props}>
      <Text sx={{ fontSize: 3, display: 'block' }} mb={2}>
        Assets
      </Text>
      <Card px={4} py={3}>
        <Flex>
          <Box sx={{ borderRight: '1px solid #e4e5e7' }} pr={4} mr={4}>
            <Text sx={{ color: '#77838F', display: 'block', fontSize: 1 }}>
              Total circulation
            </Text>
            <Text sx={{ fontSize: 3 }}>
              {marketCap
                ? formatCurrency(parseFloat(formatEther(marketCap)))
                : '0.00'}{' '}
              {token.symbol}
            </Text>
          </Box>
          <Box>
            <Text sx={{ color: '#77838F', display: 'block', fontSize: 1 }}>
              Total collateral assets
            </Text>
            <AssetsChart />
          </Box>
        </Flex>
      </Card>
      {/* <Grid columns={3} gap={0} mb={5}>
        {collaterals.map((collateral) => (
          <Card key={collateral.address}>
            <InfoBox title={collateral.value} subtitle={collateral.name} />
          </Card>
        ))}
      </Grid> */}
    </Box>
  )
}

export default AssetsOverview
