import LeafIcon from '@/components/icons/LeafIcon'
import RootIcon from '@/components/icons/RootIcon'
import { Skeleton } from '@/components/ui/skeleton'
import ChainLogo from 'components/icons/ChainLogo'
import SmallRootIcon from 'components/icons/SmallRootIcon'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Box, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { NETWORKS, capitalize } from 'utils/constants'
import useHistoricalTVL from '../hooks/useHistoricalTVL'
import useProtocolMetrics from '../hooks/useProtocolMetrics'

const COLORS: Record<string, any> = {
  ethereum: {
    fill: '#fff',
    stroke: '#fff',
    // stroke: '#3B3B3B',
  },
  base: {
    fill: '#fff',
    stroke: '#fff',
    // stroke: '#1552F0',
  },
  arbitrum: {
    fill: '#fff',
    stroke: '#fff',
    // stroke: '#162B4E',
  },
}

function CustomTooltip({ payload, label, active }: any) {
  if (!active || !payload) return null

  const total = payload?.reduce(
    (acc: number, item: { value: number }) => acc + item.value,
    0
  )

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid',
        borderColor: 'reserveBackground',
        background: 'cardAlternative',
        gap: 3,
        p: 0,
        minWidth: '280px',
      }}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{
          gap: 3,
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'borderSecondary',
        }}
        p={3}
      >
        <Text sx={{ fontSize: 1 }}>
          {new Date(label).toDateString().replace(/^\S+\s/, '')}
        </Text>
        <Text color="secondaryText" sx={{ fontSize: 1 }}>
          (TVL per network)
        </Text>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
        px={3}
      >
        {(payload as any[]).map(
          (item: { name: string; value: number }, index) => (
            <Box
              key={`${item.name}${item.value}${index}`}
              variant="layout.verticalAlign"
              sx={{ gap: 2, justifyContent: 'space-between' }}
            >
              <Box variant="layout.verticalAlign" sx={{ gap: '6px' }}>
                <ChainLogo chain={NETWORKS[item.name]} />
                <Text>{capitalize(item.name)}:</Text>
              </Box>
              <Text variant="bold">${formatCurrency(item.value, 0)}</Text>
            </Box>
          )
        )}
      </Box>
      <Box
        variant="layout.verticalAlign"
        sx={{
          gap: 2,
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'borderSecondary',
        }}
        p={3}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: '6px' }}>
          <SmallRootIcon />
          <Text>Total TVL:</Text>
        </Box>
        <Text color="accentInverted" variant="bold">
          ${formatCurrency(total, 0)}
        </Text>
      </Box>
    </Card>
  )
}

const Heading = () => {
  const {
    data: { tvl, rsrStakerAnnualizedRevenue, rTokenAnnualizedRevenue },
    isLoading,
  } = useProtocolMetrics()

  const revenue = rsrStakerAnnualizedRevenue + rTokenAnnualizedRevenue

  return (
    <div className="absolute top-6 left-6 flex flex-col gap-2 text-white">
      <RootIcon />
      <h2 className="text-2xl mt-2 font-light">TVL in Reserve</h2>
      {isLoading ? (
        <Skeleton className="w-72 h-[50px]" />
      ) : (
        <h3 className="text-[50px] font-semibold leading-none ">
          ${formatCurrency(tvl, 0)}
        </h3>
      )}

      <div className="flex gap-2 mt-2">
        <LeafIcon />
        <span>Annualized protocol revenue:</span>
        {isLoading || !revenue ? (
          <Skeleton className="h-6 w-14" />
        ) : (
          <span className="font-bold">
            $
            {formatCurrency(revenue, 1, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        )}
      </div>
    </div>
  )
}

const HistoricalTVLChart = () => {
  const data = useHistoricalTVL()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 40,
          right: 0,
          bottom: -10,
          left: 0,
        }}
      >
        <XAxis dataKey="day" style={{ display: 'none' }} />
        <YAxis hide visibility="0" domain={['dataMin', 'dataMax']} />
        <Tooltip content={<CustomTooltip />} />
        {Object.keys(NETWORKS).map((network) => (
          <Area
            key={network}
            type="monotone"
            dataKey={network}
            stackId="1"
            stroke={COLORS[network].stroke}
            fill={COLORS[network].fill}
            fillOpacity="1"
            activeDot={{ r: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

const HistoricalTVL = () => {
  return (
    <div className="flex flex-col h-full px-4 pt-4">
      <Heading />
      <div className="h-full -mb-2">
        <HistoricalTVLChart />
      </div>
    </div>
  )
}

export default HistoricalTVL
