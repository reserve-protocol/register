import { Trans } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenDistributionAtom, rTokenPriceAtom } from 'state/atoms'
import { Badge, Box, BoxProps, Card, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

const data = [
  { name: 'A1', value: 1 },
  { name: 'A2', value: 1 },
  { name: 'B1', value: 1 },
  { name: 'A2', value: 1 },
  { name: 'B1', value: 1 },
  { name: 'A2', value: 1 },
  { name: 'B1', value: 1 },
  { name: 'A1', value: 1 },
]

const HistoricalData = (props: BoxProps) => {
  const rToken = useRToken()
  const price = useAtomValue(rTokenPriceAtom)
  const { insurance } = useAtomValue(rTokenDistributionAtom)

  return (
    <Card {...props} p={5}>
      <Box mb={5}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Price</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart title={`$${formatCurrency(price)}`} data={data} />
        <Flex mt={3} sx={{ alignItems: 'center' }}>
          <Badge mr={3}>24h</Badge>
          <Text sx={{ cursor: 'pointer' }} mr={3}>
            7d
          </Text>
          <Text sx={{ cursor: 'pointer' }}>30d</Text>
        </Flex>
      </Box>
      <Box>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Supply</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart title={'0'} data={data} />
        <Flex mt={3} sx={{ alignItems: 'center' }}>
          <Badge mr={3}>24h</Badge>
          <Text sx={{ cursor: 'pointer' }} mr={3}>
            7d
          </Text>
          <Text sx={{ cursor: 'pointer' }}>30d</Text>
        </Flex>
      </Box>
      {!rToken?.isRSV && (
        <Box mt={5}>
          <Flex variant="layout.verticalAlign" mb={4}>
            <Text sx={{ fontSize: 3 }}>
              <Trans>Insurance</Trans>
            </Text>
            <Box mx="auto" />
            <Help content="TODO" />
          </Flex>
          <AreaChart title={`${insurance}%`} data={data} />
          <Flex mt={3} sx={{ alignItems: 'center' }}>
            <Badge mr={3}>24h</Badge>
            <Text sx={{ cursor: 'pointer' }} mr={3}>
              7d
            </Text>
            <Text sx={{ cursor: 'pointer' }}>30d</Text>
          </Flex>
        </Box>
      )}
    </Card>
  )
}

export default HistoricalData
