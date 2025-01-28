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
import useHistoricalTVL from '@/views/home/hooks/useHistoricalTVL'
import useProtocolMetrics from '@/views/home/hooks/useProtocolMetrics'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'

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

  return (
    <div className="absolute top-8 w-full flex justify-between text-white">
      <div>
        <RootIcon className="border rounded-full h-[32px] w-[32px]" />
        <h2 className="text-[22px] mt-6 mb-4 font-light leading-none">
          TVL in Reserve
        </h2>
        {isLoading ? (
          <Skeleton className="w-88 h-[60px]" />
        ) : (
          <div className="flex items-center">
            <h3 className="text-[60px] font-semibold leading-none">
              ${formatCurrency(tvl, 0)}
            </h3>
            <Button
              variant="none"
              className="ml-3 w-[44px] h-[44px] p-0 bg-[#276ab6] text-white hover:bg-[#276ab6]"
              size="icon-rounded"
            >
              <ArrowRight className="-rotate-45" size={24} />
            </Button>
          </div>
        )}

        <div className="flex gap-2 mt-3 text-[22px] leading-none">
          <span className="font-light">Annualized protocol revenue:</span>
          {isLoading ? (
            <Skeleton className="h-6 w-14" />
          ) : (
            <span className="font-bold">
              $
              {formatCurrency(
                rsrStakerAnnualizedRevenue + rTokenAnnualizedRevenue,
                1,
                {
                  notation: 'compact',
                  compactDisplay: 'short',
                }
              )}
            </span>
          )}
        </div>
      </div>
      <div>
        <Button
          variant="outline"
          className="rounded-[50px] p-1 h-8 hover:bg-white"
        >
          <div className="rounded-full w-6 h-6 bg-white text-primary flex items-center justify-center">
            <Play size={12} fill="currentColor" />
          </div>
          <span className="ml-1 mr-2">What are DTFs?</span>
        </Button>
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
          right: 0,
          bottom: -30,
          left: 0,
        }}
      >
        <XAxis dataKey="day" style={{ display: 'none' }} />
        <YAxis hide visibility="0" domain={['dataMin', 'dataMax']} />
        <Tooltip content={<CustomTooltip />} />
        {Object.keys(NETWORKS).map((network) => (
          <Area
            key={network}
            type="step"
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
    <div className="container px-6 h-[520px]">
      <div className="relative h-full flex flex-col justify-end">
        <div className="h-[420px]">
          <HistoricalTVLChart />
        </div>
        <Heading />
      </div>
    </div>
  )
}

export default HistoricalTVL
