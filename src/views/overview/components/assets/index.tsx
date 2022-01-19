import styled from '@emotion/styled'
import { Box, Flex, Text } from '@theme-ui/components'
import { Card } from 'components'
import { formatEther } from 'ethers/lib/utils'
import useTokenSupply from 'hooks/useTokenSupply'
import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { ReserveToken } from 'types'
import { formatCurrency, stringToColor } from 'utils'

const ColorBox = styled('div')`
  background-color: ${(props: any) => props.color};
  width: 10px;
  height: 10px;
`

const AssetsChart = ({ collaterals }: { collaterals: any }) => (
  <Flex p={2} sx={{ alignItems: 'center' }}>
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
          <Cell key={`cell-${entry.address}`} fill={entry.fill} />
        ))}
      </Pie>
    </PieChart>
    <Box ml={4}>
      {collaterals.map((collateral: any) => (
        <Flex sx={{ alignItems: 'center' }} mt={1}>
          <ColorBox color={collateral.fill} />
          <Box ml={3}>
            <Text
              sx={{
                fontSize: 1,
                color: '#77838F',
                display: 'block',
              }}
            >
              {collateral.symbol}
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
      value: 0,
      fill: stringToColor(collateral.token.name + collateral.token.symbol),
    }))
  )
  const marketCap = useTokenSupply(token.address)

  useEffect(() => {
    if (marketCap) {
      if (isRSV) {
        const distribution = parseFloat(formatEther(marketCap.div(3)))

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
          <Box
            sx={{
              borderRight: '1px solid #e4e5e7',
              display: 'flex',
              flexDirection: 'column',
            }}
            pr={5}
            mr={5}
          >
            <Text sx={{ color: '#77838F', display: 'block', fontSize: 1 }}>
              Total circulation
            </Text>
            <Text sx={{ fontSize: 3, display: 'block' }}>
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
            <AssetsChart collaterals={collaterals} />
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}

export default AssetsOverview
