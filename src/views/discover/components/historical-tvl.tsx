import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trackClick } from '@/hooks/useTrackPage'
import { devModeAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import ChainLogo from 'components/icons/ChainLogo'
import SmallRootIcon from 'components/icons/SmallRootIcon'
import { useAtomValue } from 'jotai'
import { ArrowRight, Clapperboard, Play } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  CHAIN_TO_NETWORK,
  DTF_VIDEO,
  DUNE_DASHBOARD,
  NETWORKS,
  capitalize,
} from 'utils/constants'
import tvlDark from '../assets/tvl-dark.svg'
import tvlLight from '../assets/tvl-light.svg'
import useAPIProtocolMetrics, {
  Metrics,
} from '../hooks/use-api-protocol-metrics'

const RoundedImageWithSkeleton = ({
  src,
  alt,
  visibilityClass,
}: {
  src: string
  alt: string
  visibilityClass: string
}) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <Skeleton className={`${visibilityClass} w-10 h-10 rounded-full`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${loaded ? visibilityClass + ' block' : 'hidden'} w-10 h-10 rounded-full object-cover`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

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
  bsc: {
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
        display: ['none', 'flex'],
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
const Heading = ({
  data,
  isLoading,
}: {
  data?: Metrics
  isLoading: boolean
}) => {
  const revenue =
    isLoading || !data
      ? 0
      : data.rsrStakerAnnualizedRevenue + data.rTokenAnnualizedRevenue
  return (
    <div className="absolute top-3 sm:top-8 left-0 sm:left-0 right-3 text-tvl px-4 sm:px-6 md:px-0 w-auto sm:w-[560px]">
      {/* Light/Dark images with 40x40 rounded skeletons */}
      <div className="relative">
        <RoundedImageWithSkeleton
          src={tvlLight}
          alt="TVL Light"
          visibilityClass="dark:hidden"
        />
        <RoundedImageWithSkeleton
          src={tvlDark}
          alt="TVL Dark"
          visibilityClass="hidden dark:block"
        />
      </div>
      <h2 className="sm:text-xl text-base mt-6 mb-4 font-light leading-none">
        TVL in Reserve
      </h2>
      {isLoading ? (
        <Skeleton className="w-[280px] sm:w-[440px] h-[40px] sm:h-[60px]" />
      ) : (
        <div className="flex items-center ">
          <h3 className="text-4xl sm:text-5xl sm:text-[60px] font-semibold leading-none">
            ${formatCurrency(data?.tvl ?? 0, 0)}
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
      <Button
        variant="outline-primary"
        className="flex items-center gap-[6px] rounded-[50px] mt-6 p-1 h-8 border border-primary dark:border-tvl/20 hover:bg-primary"
        onClick={() => {
          trackClick('discover', 'video')
          window.open(DTF_VIDEO, '_blank')
        }}
      >
        <span className="ml-2">
          <Clapperboard size={16} />
        </span>
        <span className="text-base dark:text-tvl">What are DTFs?</span>
        <span className="rounded-full w-6 h-6 bg-primary text-primary flex items-center justify-center">
          <Play size={16} className="text-white" fill="#fff" />
        </span>
      </Button>
    </div>
  )
}

const HistoricalTVLChart = ({ data }: { data?: Metrics }) => {
  const isDevMode = useAtomValue(devModeAtom)
  const networks = Object.values(NETWORKS).filter(
    (n) => isDevMode || n !== ChainId.BSC
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data?.tvlTimeseries ?? []}
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

const HistoricalTVL = () => {
  const data = useAPIProtocolMetrics()
  return (
    <div className="container px-0 md:px-6 2xl:px-6 h-80 sm:h-[580px]">
      <div className="relative h-full flex flex-col justify-end ">
        <div className="h-[160px] sm:h-[420px]">
          <HistoricalTVLChart {...data} />
        </div>
        <Heading {...data} />
      </div>
    </div>
  )
}

export default HistoricalTVL
