import styled from '@emotion/styled'
import { formatEther } from '@ethersproject/units'
import { Card } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import useAssets from 'hooks/useAssets'
import useTokenSupply from 'hooks/useTokenSupply'
import { Cell, Pie, PieChart } from 'recharts'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  data: ReserveToken
}

const ColorBox = styled('div')`
  background-color: ${(props: any) => props.color};
  width: 10px;
  height: 10px;
`

const AssetsChart = ({ collaterals }: { collaterals: any }) => (
  <Flex p={[2, 1, 2]} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
    <PieChart width={100} height={100}>
      <Pie
        data={collaterals}
        dataKey="value"
        nameKey="symbol"
        innerRadius={38}
        outerRadius={50}
        fill="#82ca9d"
      >
        {collaterals.map((entry: any) => (
          <Cell key={`cell-${entry?.address}`} fill={entry?.fill} />
        ))}
      </Pie>
    </PieChart>
    <Box ml={4}>
      {collaterals.map((collateral: any) => (
        <Flex key={collateral.address} sx={{ alignItems: 'center' }} mt={1}>
          <ColorBox color={collateral.fill} />
          <Box ml={3}>
            <Text
              sx={{
                fontSize: 1,
                color: '#77838F',
                display: 'block',
              }}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <TokenLogo
                  sx={{ marginRight: '5px' }}
                  symbol={collateral.symbol}
                  size="20px"
                />{' '}
                {collateral.symbol}
              </Flex>
            </Text>
            <Text>{formatCurrency(collateral.value)}</Text>
          </Box>
        </Flex>
      ))}
    </Box>
  </Flex>
)

/**
 * RToken Assets overview
 * Display the market cap of the current RToken and the ratio between the RToken and their basket collaterals
 *
 * @prop data: ReserveToken
 * @returns React.Component
 */
const AssetsOverview = ({ data, ...props }: Props) => {
  const marketCap = useTokenSupply(data.address)
  // const collaterals = useAssets(data, marketCap)

  return (
    <Box mb={3} {...props}>
      <Text variant="sectionTitle" mb={2}>
        Assets
      </Text>
      <Card px={[4, 4, 3]} py={3}>
        <Flex>
          <Box
            sx={{
              borderRight: '1px solid #e4e5e7',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
            pr={4}
            mr={4}
          >
            <Text variant="contentTitle">Total circulation</Text>
            <Text sx={{ fontSize: 3, display: 'block', margin: 'auto' }}>
              {marketCap
                ? formatCurrency(parseFloat(formatEther(marketCap)))
                : '0.00'}{' '}
              {data.symbol}
            </Text>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Text variant="contentTitle">Total collateral assets</Text>
            {/* <AssetsChart collaterals={collaterals} /> */}
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}

export default AssetsOverview
