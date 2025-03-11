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
import {
  DTF_VIDEO,
  DUNE_DASHBOARD,
  NETWORKS,
  capitalize,
} from 'utils/constants'
import useHistoricalTVL, {
  DailyTVL,
  DEFAULT_TVL_BY_CHAIN,
} from '@/views/home/hooks/useHistoricalTVL'
import useProtocolMetrics from '@/views/home/hooks/useProtocolMetrics'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import useDTFHistoricalTVL, { DTFStats } from '../hooks/use-dtf-historical-tvl'
import { useMemo } from 'react'
import { trackClick } from '@/hooks/useTrackPage'
import tvlLight from '../assets/tvl-light.svg'
import tvlDark from '../assets/tvl-dark.svg'

const COLORS: Record<string, any> = {
  ethereum: {
    fill: 'hsl(var(--tvl))',
    // stroke: '#fff',
    stroke: 'hsl(var(--tvl))',
  },
  base: {
    fill: 'hsl(var(--tvl))',
    // stroke: '#fff',
    stroke: 'hsl(var(--tvl))',
  },
  arbitrum: {
    fill: 'hsl(var(--tvl))',
    // stroke: '#fff',
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

// TODO: Improve loading revenue state, currently have a hardcoded if
const Heading = ({ dtfStats }: { dtfStats?: DTFStats }) => {
  const {
    data: { tvl: rTVL, rsrStakerAnnualizedRevenue, rTokenAnnualizedRevenue },
    isLoading,
  } = useProtocolMetrics()

  const revenue =
    rsrStakerAnnualizedRevenue +
    rTokenAnnualizedRevenue +
    Object.keys(NETWORKS).reduce((revenue, chain) => {
      if (!dtfStats || !dtfStats[chain] || dtfStats[chain].length === 0) {
        return revenue
      }
      return revenue + dtfStats[chain].slice(-1)[0].revenue
    }, 0)
  const tvl =
    rTVL +
    Object.keys(NETWORKS).reduce((tvl, chain) => {
      if (!dtfStats || !dtfStats[chain] || dtfStats[chain].length === 0) {
        return tvl
      }
      return tvl + dtfStats[chain].slice(-1)[0].tvl
    }, 0)

  return (
    <>
      <div className="absolute top-3 sm:top-8 left-0 sm:left-0 right-3 text-tvl px-4 sm:px-6 md:px-0 w-auto sm:w-[560px]">
        {/* Light Mode Image */}
        <img src={tvlLight} alt="TVL Light" className="dark:hidden" />

        {/* Dark Mode Image */}
        <img src={tvlDark} alt="TVL Dark" className="hidden dark:block" />
        <h2 className="sm:text-xl text-base mt-6 mb-4 font-light leading-none">
          TVL in Reserve
        </h2>
        {isLoading ? (
          <Skeleton className="w-[320px] h-[60px]" />
        ) : (
          <div className="flex items-center ">
            <h3 className="text-4xl sm:text-5xl sm:text-[60px] font-semibold leading-none">
              ${formatCurrency(tvl, 0)}
            </h3>
            <Link target="_blank" to={DUNE_DASHBOARD}>
              <Button
                variant="none"
                className="ml-3  w-10 h-10 sm:w-[44px] sm:h-[44px] p-0 bg-tvl/10 text-tvl hover:bg-primary/20"
                size="icon-rounded"
              >
                <ArrowRight className="-rotate-45" size={24} />
              </Button>
            </Link>
          </div>
        )}

        <div className="flex gap-2 mt-5 text-base sm:text-xl leading-none">
          <span className="font-light">Annualized protocol revenue:</span>
          {isLoading || revenue < 1000000 ? (
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
      <div className="absolute hidden sm:block top-3 sm:top-8 right-0 text-primary">
        <Button
          variant="outline-primary"
          className="rounded-[50px] p-1 h-8 border border-primary  dark:border-tvl/20 hover:bg-primary"
          onClick={() => {
            trackClick('discover', 'video')
            window.open(DTF_VIDEO, '_blank')
          }}
        >
          <div className="rounded-full w-6 h-6 bg-primary text-primary flex items-center justify-center">
            <Play size={16} fill="#fff" />
          </div>
          <span className="ml-2 mr-2 dark:text-tvl">What are DTFs?</span>
        </Button>
      </div>
    </>
  )
}

const HistoricalTVLChart = ({ dtfStats }: { dtfStats?: DTFStats }) => {
  const data = useHistoricalTVL()

  const updated = useMemo(() => {
    if (data.length == 0 || !dtfStats) {
      return data
    }

    const lookup: Record<number, DailyTVL> = {}

    for (const key in NETWORKS) {
      const k = key as keyof typeof NETWORKS
      if (!dtfStats[k]) {
        continue
      }
      for (const entry of dtfStats[k]) {
        const { timestamp, tvl } = entry
        const ts = timestamp * 1_000
        if (!lookup[timestamp]) {
          lookup[ts] = { day: ts, ...DEFAULT_TVL_BY_CHAIN }
        }
        lookup[ts][k] = (lookup[ts][k] || 0) + tvl
      }
    }

    return data.map((entry) => {
      const updatedValues = lookup[entry.day] || {}
      const newEntry = { ...entry }

      for (const key in NETWORKS) {
        newEntry[key] = (entry[key] || 0) + (updatedValues[key] || 0)
      }

      return newEntry
    })
  }, [data, dtfStats])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={updated}
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
  const { data: dtfStats } = useDTFHistoricalTVL()
  return (
    <div className="container px-0 md:px-6 2xl:px-6 h-80 sm:h-[580px]">
      <div className="relative h-full flex flex-col justify-end ">
        <div className="h-[160px] sm:h-[420px]">
          <HistoricalTVLChart dtfStats={dtfStats} />
        </div>
        <Heading dtfStats={dtfStats} />
      </div>
    </div>
  )
}

export default HistoricalTVL
