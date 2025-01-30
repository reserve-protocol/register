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
    fill: '#2150A9',
    // stroke: '#fff',
    stroke: '#2150A9',
  },
  base: {
    fill: '#2150A9',
    // stroke: '#fff',
    stroke: '#2150A9',
  },
  arbitrum: {
    fill: '#2150A9',
    // stroke: '#fff',
    stroke: '#2150A9',
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
    <>
      <div className="absolute top-3 sm:top-8 left-3 sm:left-0 right-3 text-primary">
        <RootIcon className="border rounded-full h-[32px] w-[32px]" />
        <h2 className="text-[22px] mt-6 mb-4 font-light leading-none">
          TVL in Reserve
        </h2>
        {isLoading ? (
          <Skeleton className="w-[320px] h-[60px]" />
        ) : (
          <div className="flex items-center justify-between sm:justify-start">
            <h3 className="text-[44px] sm:text-[60px] font-semibold leading-none">
              ${formatCurrency(tvl, 0)}
            </h3>
            <Button
              variant="none"
              className="ml-3 w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] p-0 bg-[#276ab6] text-white hover:bg-[#276ab6]"
              size="icon-rounded"
            >
              <ArrowRight className="-rotate-45" size={24} />
            </Button>
          </div>
        )}

        <div className="flex justify-between sm:justify-start gap-2 mt-3 text-[22px] leading-none">
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
      <div className="absolute top-3 sm:top-8 right-3 sm:right-0 text-primary">
        <Button
          variant="outline-primary"
          className="rounded-[50px] p-1 h-8 hover:bg-primary"
        >
          <div className="rounded-full w-6 h-6 bg-primary text-primary flex items-center justify-center">
            <Play size={16} fill="#fff" />
          </div>
          <span className="ml-1 mr-2">What are DTFs?</span>
        </Button>
      </div>
    </>
  )
}

const HistoricalTVLChart = () => {
  // TODO(jg): Add DTF TVL
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
        <Tooltip wrapperStyle={{ zIndex: 1000 }} content={<CustomTooltip />} />
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
    <div className="container px-0 2xl:px-6 h-[400px] sm:h-[520px]">
      <div className="relative h-full flex flex-col justify-end border-t border-primary">
        <div className="h-[160px] sm:h-[420px]">
          <HistoricalTVLChart />
        </div>
        <Heading />
      </div>
    </div>
  )
}

export default HistoricalTVL
