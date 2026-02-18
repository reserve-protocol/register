import { devModeAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import ChainLogo from 'components/icons/ChainLogo'
import SmallRootIcon from 'components/icons/SmallRootIcon'
import { useAtomValue } from 'jotai'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from 'utils'
import { CHAIN_TO_NETWORK, NETWORKS, capitalize } from 'utils/constants'

const COLORS: Record<string, { fill: string; stroke: string }> = {
  ethereum: {
    fill: 'hsl(var(--tvl))',
    stroke: 'hsl(var(--tvl))',
  },
  base: {
    fill: 'hsl(var(--tvl))',
    stroke: 'hsl(var(--tvl))',
  },
  arbitrum: {
    fill: 'hsl(var(--tvl))',
    stroke: 'hsl(var(--tvl))',
  },
  bsc: {
    fill: 'hsl(var(--tvl))',
    stroke: 'hsl(var(--tvl))',
  },
}

function CustomTooltip({ payload, label, active }: any) {
  if (!active || !payload) return null

  const total = payload?.reduce(
    (acc: number, item: { value: number }) => acc + item.value,
    0
  )

  return (
    <div className="hidden md:flex flex-col border-2 border-muted bg-card rounded-xl min-w-[280px]">
      <div className="flex items-center gap-4 justify-between border-b border-border p-4">
        <span className="text-sm">
          {new Date(label).toDateString().replace(/^\S+\s/, '')}
        </span>
        <span className="text-legend text-sm">(TVL per network)</span>
      </div>
      <div className="flex flex-col gap-1 px-4">
        {(payload as any[]).map(
          (item: { name: string; value: number }, index) => (
            <div
              key={`${item.name}${item.value}${index}`}
              className="flex items-center gap-2 justify-between"
            >
              <div className="flex items-center gap-1.5">
                <ChainLogo chain={NETWORKS[item.name]} />
                <span>{capitalize(item.name)}:</span>
              </div>
              <span className="font-bold">${formatCurrency(item.value, 0)}</span>
            </div>
          )
        )}
      </div>
      <div className="flex items-center gap-2 justify-between border-t border-border p-4">
        <div className="flex items-center gap-1.5">
          <SmallRootIcon />
          <span>Total TVL:</span>
        </div>
        <span className="text-primary font-bold">
          ${formatCurrency(total, 0)}
        </span>
      </div>
    </div>
  )
}

interface HistoricalTVLChartProps {
  tvlTimeseries?: Array<Record<string, number>>
}

const HistoricalTVLChart = ({ tvlTimeseries }: HistoricalTVLChartProps) => {
  const isDevMode = useAtomValue(devModeAtom)
  const networks = Object.values(NETWORKS).filter(
    (n) => isDevMode || n !== ChainId.BSC
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={tvlTimeseries ?? []}
        margin={{
          right: 1,
          bottom: -30,
          left: 0,
        }}
      >
        <XAxis dataKey="timestamp" style={{ display: 'none' }} />
        <YAxis hide visibility="0" domain={['dataMin', 'dataMax']} />
        <Tooltip wrapperStyle={{ zIndex: 1000 }} content={<CustomTooltip />} />
        {networks.map((network) => (
          <Area
            key={network}
            type="step"
            name={CHAIN_TO_NETWORK[network]}
            dataKey={network}
            stackId="1"
            stroke={COLORS[CHAIN_TO_NETWORK[network]].stroke}
            fill={COLORS[CHAIN_TO_NETWORK[network]].fill}
            fillOpacity="1"
            activeDot={{ r: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default HistoricalTVLChart
