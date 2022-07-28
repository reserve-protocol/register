import { Trans } from '@lingui/macro'
import { RToken } from 'abis/types'
import TokenLogo from 'components/icons/TokenLogo'
import { useRTokenContract } from 'hooks/useContract'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { rTokenDistributionAtom, rTokenPriceAtom } from 'state/atoms'
import { Box, BoxProps, Card, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

const data = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A1', value: 100 },
]

const colors = [
  '#000000',
  '#333333',
  '#4C4C4C',
  '#666666',
  '#808080',
  '#999999',
  '#B3B3B3',
  '#CCCCCC',
]

interface ChartProps extends BoxProps {
  data: { name: string; value: number }[]
  insurance: number
}

const CollateralChart = ({ data, insurance, ...props }: ChartProps) => (
  <Box {...props} sx={{ position: 'relative' }}>
    <ResponsiveContainer height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Pie
          dataKey="value"
          data={[{ value: 100, name: 'insurance' }]}
          cx="50%"
          cy="50%"
          innerRadius={90}
          outerRadius={100}
          fill="#11BB8D"
          {...getAngles(insurance)}
        />
      </PieChart>
    </ResponsiveContainer>
    <Box
      sx={{
        top: 'calc(50% - 8px)',
        left: 'calc(50% - 12px)',
        position: 'absolute',
      }}
    >
      <TokenLogo size={24} symbol="rsv" />
    </Box>
  </Box>
)

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100) / 2
  return { startAngle: 270 + radius, endAngle: 270 - radius }
}

const AssetOverview = () => {
  const rToken = useRToken()
  const [distribution, setDistribution] = useAtom(rTokenDistributionAtom)
  const contract = useRTokenContract(rToken?.address)
  const price = useAtomValue(rTokenPriceAtom)

  const getDistribution = useCallback(async (rTokenContract: RToken) => {
    // const quote =
  }, [])

  useEffect(() => {
    if (contract) {
      getDistribution(contract)
    }
  }, [contract])

  return (
    <Card py={5}>
      <Grid columns={2} gap={2}>
        <Flex
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Text>
            <Trans>Basket of 1 {rToken?.symbol}</Trans>
          </Text>
          <Text variant="legend">${formatCurrency(price ?? 0)}</Text>
          <CollateralChart mb={4} mt={2} data={data} insurance={30} />
          <Text variant="legend">
            <Trans>Backing</Trans>
            <Box as="span" ml={2} sx={{ fontWeight: 'bold', color: 'text' }}>
              100%
            </Box>
          </Text>
          <Text variant="legend">
            <Trans>Insurance coverage</Trans>
            <Box as="span" ml={2} sx={{ fontWeight: 'bold', color: 'text' }}>
              30%
            </Box>
          </Text>{' '}
        </Flex>
        <Box>
          {(rToken?.collaterals ?? []).map((c) => (
            <Flex mb={2} key={c.address}>
              <TokenLogo symbol={c.symbol} mr={3} />
              <Text>{c.symbol}</Text>
              <Text ml="auto">30%</Text>
            </Flex>
          ))}
        </Box>
      </Grid>
    </Card>
  )
}

export default AssetOverview
