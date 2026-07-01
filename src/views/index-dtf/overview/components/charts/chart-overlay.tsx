import InactiveBadge from '@/components/inactive-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { cn } from '@/lib/utils'
import { btcPriceAtom } from '@/state/chain/atoms/chainAtoms'
import {
  indexDTFAtom,
  indexDTFPriceAtom,
  indexDTFStatusAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import {
  indexDTFApyAtom,
  isYieldIndexDTFAtom,
} from '@/state/dtf/yield-index-atoms'
import { formatPercentage, formatToSignificantDigits } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import IndexCreatorOverview from '../index-creator-overview'
import IndexTokenAddress from '../index-token-address'
import IndexTokenLogo from '../index-token-logo'
import ChartTypeSelector from './chart-type-selector'
import MarketPriceToggle from './market-price-toggle'
import PercentageChange from './percentage-change'
import {
  apyStatsAtom,
  dataTypeAtom,
  isMarketPriceVisibleAtom,
  marketPriceInfoAtom,
} from './price-chart-atoms'
import { MARKET_PRICE_STROKE } from './price-chart-constants'
import TimeRangeMenu from './time-range-menu'

const OverlayHeaderActions = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  if (isYieldIndexDTF) {
    return (
      <>
        <div className="hidden xl:flex items-center gap-2">
          <IndexTokenAddress />
          <IndexCreatorOverview />
        </div>
        <div className="flex xl:hidden items-center gap-2">
          <IndexCreatorOverview />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hidden xl:flex items-center gap-2">
        <IndexCreatorOverview />
        <MarketPriceToggle />
        <ChartTypeSelector />
      </div>
      <div className="flex xl:hidden items-center gap-2">
        <TimeRangeMenu />
        <MarketPriceToggle />
        <ChartTypeSelector />
      </div>
    </>
  )
}

const OverlayTitle = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const isInactive = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  if (!dtf) {
    return <Skeleton className="w-[250px] h-7 sm:h-8" />
  }

  return (
    <h2 className="text-xl sm:text-2xl font-light w-full break-words">
      <div className="flex items-center gap-2">
        {dtf.token.name}
        {isInactive && <InactiveBadge className="block sm:hidden" />}
      </div>
    </h2>
  )
}

const YieldOverlayInfo = () => {
  const apyData = useAtomValue(indexDTFApyAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const stats = useAtomValue(apyStatsAtom)

  return (
    <>
      <div className="flex items-center gap-2 text-xl sm:text-2xl font-light">
        {apyData ? (
          <Trans>{formatPercentage(apyData.totalAPY)} Est. APY</Trans>
        ) : (
          <Skeleton className="w-[200px] h-7 sm:h-8" />
        )}
      </div>
      {stats && (
        <span className="text-sm text-white/60">
          <Trans>
            Avg {formatPercentage(stats.avg)} · range{' '}
            {formatPercentage(stats.min)}–{formatPercentage(stats.max)} (
            {range === 'all' ? 'All' : range})
          </Trans>
        </span>
      )}
    </>
  )
}

const PriceValue = () => {
  const dataType = useAtomValue(dataTypeAtom)
  const price = useAtomValue(indexDTFPriceAtom)
  const btcPrice = useAtomValue(btcPriceAtom)
  const isBTCMode = dataType === 'priceBTC'

  if (isBTCMode) {
    const priceInBTC = price && btcPrice ? price / btcPrice : null
    if (priceInBTC === null) {
      return <Skeleton className="w-[100px] h-6 sm:h-7 mt-1" />
    }
    return <>₿{formatToSignificantDigits(priceInBTC)}</>
  }

  if (!price) {
    return <Skeleton className="w-[100px] h-6 sm:h-7 mt-1" />
  }

  return (
    <>
      {dataType !== 'totalSupply' ? '$' : ''}
      {formatToSignificantDigits(price)}
    </>
  )
}

const MarketPriceReadout = () => {
  const isVisible = useAtomValue(isMarketPriceVisibleAtom)
  const { latest } = useAtomValue(marketPriceInfoAtom)

  if (!isVisible || latest === null) {
    return null
  }

  return (
    <>
      <span className="text-sm text-white/40">·</span>
      <div className="flex items-center gap-1.5 text-sm text-white/60">
        <svg width="14" height="6" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="14"
            y2="3"
            stroke={MARKET_PRICE_STROKE}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
        <span>
          <Trans>Market</Trans> ${formatToSignificantDigits(latest)}
        </span>
      </div>
    </>
  )
}

const PriceOverlayInfo = ({
  timeseries,
}: {
  timeseries: IndexDTFPerformance['timeseries']
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const range = useAtomValue(performanceTimeRangeAtom)

  return (
    <div className="flex items-center gap-2 text-xl sm:text-2xl font-light">
      <PriceValue />
      <div className="text-sm">
        {timeseries.length === 0 ? (
          <Skeleton className="w-[100px] h-6" />
        ) : (
          <PercentageChange
            performance={timeseries}
            dataType={dataType}
            range={range}
          />
        )}
      </div>
      <MarketPriceReadout />
    </div>
  )
}

const ChartOverlay = ({
  timeseries,
}: {
  timeseries: IndexDTFPerformance['timeseries']
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const isYieldMode = dataType === 'yield'
  const isInactive = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        isYieldMode ? '-mb-1.5 sm:-mb-2.5' : 'mb-0 sm:mb-3'
      )}
    >
      <div className="flex items-center gap-1 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white/20 rounded-full p-[1px] w-fit">
            <IndexTokenLogo />
          </div>
          {isInactive && <InactiveBadge className="hidden sm:block" />}
        </div>
        <OverlayHeaderActions />
      </div>
      <div className="flex flex-col gap-0.5">
        <OverlayTitle />
        {isYieldMode ? (
          <YieldOverlayInfo />
        ) : (
          <PriceOverlayInfo timeseries={timeseries} />
        )}
      </div>
    </div>
  )
}

export default ChartOverlay
