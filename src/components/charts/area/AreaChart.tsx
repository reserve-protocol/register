import { Trans } from '@lingui/macro'
import TabMenu from 'components/tab-menu'
import { useMemo } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  Area,
  AreaChart as Chart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { StringMap } from 'types'
import { formatCurrency } from 'utils'

type ChartData = { value: number; label?: string; display?: string }[]

interface Props {
  data: ChartData
  title: React.ReactNode
  heading?: string
  timeRange?: StringMap
  currentRange?: string
  onRangeChange?(range: string): void
  height?: number
  moreActions?: React.ReactNode
  domain?: [number | string, number | string]
  className?: string
}

function CustomTooltip({ payload, active }: any) {
  if (active && payload) {
    return (
      <Card className="p-3">
        <span className="text-base block text-foreground font-bold mb-2">
          {payload[0]?.payload?.display || payload[0]?.payload?.value}
        </span>
        <span className="text-legend text-sm">
          {payload[0]?.payload?.label}
        </span>
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

  const gainColorClass =
    gain >= 0.01 ? 'text-primary' : gain < 0 ? 'text-destructive' : 'text-legend'

  return (
    <div className={cn('ml-auto flex items-center', gainColorClass)}>
      {gain >= 0.01 && <ArrowUp strokeWidth={1.2} />}
      {gain < 0 && <ArrowDown strokeWidth={1.2} />}
      <span className="ml-2 font-bold">
        {gain >= 0.01 && '+'}
        {formatCurrency(gain)}%
      </span>
    </div>
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
  className,
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
    <div className={cn('relative', className)}>
      {heading && (
        <div className="flex items-center mb-1 ml-2">
          <span className="text-lg font-bold">{heading}</span>
        </div>
      )}
      <div className="flex text-lg ml-2 mb-4">
        {title}
        <Gain data={data} />
      </div>
      {data && !!data.length && (
        <ResponsiveContainer height={height}>
          <Chart data={data}>
            <YAxis hide visibility="0" domain={domain} />

            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2150A9"
              strokeWidth={2}
              fill="#E4EAF5"
            />
          </Chart>
        </ResponsiveContainer>
      )}
      {data && !data.length && (
        <div className="my-8 text-center" style={{ height: height - 40 }}>
          <span className="text-legend">
            <Trans>No data</Trans>
          </span>
        </div>
      )}
      {!data && (
        <div
          className="flex w-full justify-center items-center"
          style={{ height }}
        >
          <Spinner size={24} />
        </div>
      )}
      <div className="flex items-center mt-2 justify-between px-1">
        {!!options && currentRange && onRangeChange && (
          <TabMenu
            items={options}
            active={currentRange}
            onMenuChange={onRangeChange}
          />
        )}
        {moreActions}
      </div>
    </div>
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
