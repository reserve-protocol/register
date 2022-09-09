import { Trans } from '@lingui/macro'
import InfoBox from 'components/info-box'
import { useMemo } from 'react'
import {
  Area,
  AreaChart as Chart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Badge, Box, BoxProps, Card, Flex, Spinner, Text } from 'theme-ui'
import { StringMap } from 'types'

interface Props extends BoxProps {
  data: { value: number; label?: string; display?: string }[]
  title: string
  heading?: string
  timeRange?: StringMap
  currentRange?: string
  onRangeChange?(range: string): void
}

function CustomTooltip({ payload, label, active }: any) {
  if (active && payload) {
    return (
      <Card>
        <InfoBox
          title={payload[0]?.payload?.display || payload[0]?.payload?.value}
          subtitle={payload[0]?.payload?.label}
        />
      </Card>
    )
  }

  return null
}

// TODO: Dark mode colors
// TODO: Use dataset to calculate +- value between range
const AreaChart = ({
  data,
  title,
  heading,
  currentRange,
  timeRange,
  onRangeChange,
  ...props
}: Props) => {
  const gain = useMemo(() => {
    if (data && data.length > 1) {
      console.log('last', data[data.length - 1].value)
      return (
        ((data[data.length - 1].value - data[0].value) / (data[0].value || 1)) *
        100
      )
    }

    return 0
  }, [data])

  return (
    <Box {...props}>
      {heading && (
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>{heading}</Text>
        </Flex>
      )}
      <Flex sx={{ fontSize: 3 }} mb={4}>
        <Text>{title}</Text>
        <Text ml="auto" sx={{ color: 'success' }}>
          {gain}%
        </Text>
      </Flex>
      {data && !!data.length && (
        <ResponsiveContainer height={100}>
          <Chart data={data}>
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#000"
              fill="rgba(0, 0, 0, 0.05)"
            />
          </Chart>
        </ResponsiveContainer>
      )}
      {data && !data.length && (
        <Box my={6} sx={{ textAlign: 'center' }}>
          <Text variant="legend">
            <Trans>No data</Trans>
          </Text>
        </Box>
      )}
      {!data && (
        <Box my={6} sx={{ textAlign: 'center' }}>
          <Spinner size={24} />
        </Box>
      )}
      {!!timeRange && onRangeChange && (
        <Flex mt={3} sx={{ alignItems: 'center' }}>
          {Object.values(timeRange).map((range) =>
            currentRange === range ? (
              <Badge sx={{ width: '48px', textAlign: 'center' }} key={range}>
                {range}
              </Badge>
            ) : (
              <Box
                key={range}
                sx={{ cursor: 'pointer', width: '48px', textAlign: 'center' }}
                onClick={() => onRangeChange(range)}
              >
                <Text>{range}</Text>
              </Box>
            )
          )}
        </Flex>
      )}
    </Box>
  )
}

export default AreaChart
