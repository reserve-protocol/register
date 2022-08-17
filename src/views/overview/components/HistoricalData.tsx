import { Trans } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import { Box, BoxProps, Flex, Text } from 'theme-ui'

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
    <Box {...props}>
      <Box variant="layout.borderBox" sx={{ borderColor: 'darkBorder' }} mb={4}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
      <Box variant="layout.borderBox" sx={{ borderColor: 'darkBorder' }} mb={4}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
      <Box variant="layout.borderBox" sx={{ borderColor: 'darkBorder' }}>
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Historical Yield - {rToken?.symbol}</Trans>
          </Text>
          <Box mx="auto" />
          <Help content="TODO" />
        </Flex>
        <AreaChart data={data} />
      </Box>
    </Box>
  )
}

export default HistoricalData
