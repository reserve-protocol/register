import InfoBox from 'components/info-box'
import {
  Area,
  AreaChart as Chart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Badge, Box, BoxProps, Card, Flex, Text } from 'theme-ui'
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
  return (
    <Box {...props}>
      {heading && (
        <Flex variant="layout.verticalAlign" mb={4}>
          <Text sx={{ fontSize: 3 }}>{heading}</Text>
        </Flex>
      )}
      <Flex sx={{ fontSize: 3 }} mb={4}>
        <Text>{title}</Text>
        <Text ml="auto" sx={{ color: '#11BB8D' }}>
          0%
        </Text>
      </Flex>
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
