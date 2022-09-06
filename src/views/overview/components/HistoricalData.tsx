import { Trans } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import { Box, BoxProps, Card, Flex, Text } from 'theme-ui'

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

const HistoricalData = (props: BoxProps) => {
  const rToken = useRToken()

  return (
    <Card {...props} p={3}>
      <Box mb={5}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
      <Box mb={5}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
      <Box>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
    </Card>
  )
}

export default HistoricalData
