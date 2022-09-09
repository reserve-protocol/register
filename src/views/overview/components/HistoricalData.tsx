import { Trans } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenDistributionAtom } from 'state/atoms'
import { Badge, Box, BoxProps, Card, Flex, Text } from 'theme-ui'
import PriceChart from './PriceChart'

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
  const { insurance } = useAtomValue(rTokenDistributionAtom)

  return (
    <Card {...props} p={5}>
      <PriceChart mb={5} />
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
