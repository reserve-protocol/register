import { Trans } from '@lingui/macro'
import InfoBox from 'components/info-box'
import TabMenu from 'components/tab-menu'
import { useMemo } from 'react'
import { ArrowDown, ArrowUp } from 'react-feather'
import {
  Area,
  AreaChart as Chart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'
import { Badge, Box, BoxProps, Card, Flex, Spinner, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency } from 'utils'

type ChartData = { value: number; label?: string; display?: string }[]

interface Props extends Omit<BoxProps, 'title'> {
  data: ChartData
  title: React.ReactNode
  heading?: string
  timeRange?: StringMap
  currentRange?: string
  onRangeChange?(range: string): void
  height?: number
  moreActions?: React.ReactNode
  domain?: [number | string, number | string]
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

const Gain = ({ data }: { data: ChartData }) => {
  const gain = useMemo(() => {
    if (data && data.length > 1) {
      return (
        ((data[data.length - 1].value - data[0].value) / (data[0].value || 1)) *
        100
      )
    }

    return 0
  }, [data])

  let gainColor = 'lightText'

  if (gain >= 0.01) {
    gainColor = 'primary'
  } else if (gain <= 0) {
    gainColor = 'danger'
  }

  return (
    <Box ml="auto" sx={{ color: gainColor }} variant="layout.verticalAlign">
      {gain >= 0.01 && <ArrowUp strokeWidth={1.2} />}
      {gain < 0 && <ArrowDown strokeWidth={1.2} />}
      <Text ml="2" variant="bold">
        {gain >= 0.01 && '+'}
        {formatCurrency(gain)}%
      </Text>
    </Box>
  )
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
  height = 100,
  moreActions,
  domain,
  ...props
}: Props) => {
  const options = useMemo(() => {
    if (!timeRange) {
      return null
    }

    return Object.values(timeRange).map((key) => ({
      key,
      label: key,
    }))
  }, [JSON.stringify(timeRange)])

  return (
    <Box {...props}>
      {heading && (
        <Flex variant="layout.verticalAlign" mb="1" ml="2">
          <Text sx={{ fontSize: 3, fontWeight: 700 }}>{heading}</Text>
        </Flex>
      )}
      <Flex sx={{ fontSize: 3 }} ml="2" mb={3}>
        {title}
        <Gain data={data} />
      </Flex>
      {data && !!data.length && (
        <ResponsiveContainer height={height}>
          <Chart data={data}>
            <YAxis hide visibility="0" domain={domain} />

            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2150A9"
              fill="#E4EAF5"
            />
          </Chart>
        </ResponsiveContainer>
      )}
      {data && !data.length && (
        <Box my={6} sx={{ textAlign: 'center', height: height - 40 }}>
          <Text variant="legend">
            <Trans>No data</Trans>
          </Text>
        </Box>
      )}
      {!data && (
        <Box my={6} sx={{ textAlign: 'center', height: height - 40 }}>
          <Spinner size={24} />
        </Box>
      )}
      <Box
        variant="layout.verticalAlign"
        mt={3}
        sx={{ justifyContent: 'space-between' }}
      >
        {!!options && currentRange && onRangeChange && (
          <TabMenu
            items={options}
            active={currentRange}
            onMenuChange={onRangeChange}
          />
        )}
        {moreActions}
      </Box>
    </Box>
  )
}

export default AreaChart

// {
//   !!timeRange && onRangeChange && (
//     <Flex sx={{ alignItems: 'center', fontWeight: 500 }}>
//       {Object.values(timeRange).map((range) =>
//         currentRange === range ? (
//           <Badge sx={{ width: '48px', textAlign: 'center' }} key={range}>
//             <Text sx={{ fontWeight: 700 }}>{range}</Text>
//           </Badge>
//         ) : (
//           <Box
//             key={range}
//             sx={{ cursor: 'pointer', width: '48px', textAlign: 'center' }}
//             onClick={() => onRangeChange(range)}
//           >
//             <Text>{range}</Text>
//           </Box>
//         )
//       )}
//     </Flex>
//   )
// }
