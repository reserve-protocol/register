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
import { indexDTFApyAtom } from '@/state/dtf/yield-index-atoms'
import { formatPercentage, formatToSignificantDigits } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import IndexTokenAddress from '../index-token-address'
import PercentageChange from './percentage-change'
import { apyStatsAtom, dataTypeAtom } from './price-chart-atoms'

// "(BSC)" / "(ETH)" suffixes are catalog bookkeeping, not display copy — the
// chain is already shown by the token address chip next to the title.
const stripChainSuffix = (name: string) =>
  name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')

const OverlayTitle = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const isInactive = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  if (!dtf) {
    return <Skeleton className="w-[250px] h-7 sm:h-8" />
  }

  return (
    <h2 className="min-w-0 text-2xl font-medium leading-tight text-primary dark:text-foreground sm:text-3xl sm:font-normal">
      <div className="flex min-w-0 items-center gap-2">
        {stripChainSuffix(dtf.token.name)}
        {isInactive && <InactiveBadge />}
      </div>
    </h2>
  )
}

const PricePerformanceChange = ({
  className,
  timeseries,
}: {
  className?: string
  timeseries: IndexDTFPerformance['timeseries']
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const range = useAtomValue(performanceTimeRangeAtom)

  if (timeseries.length === 0) {
    return <Skeleton className={cn('h-6 w-[100px]', className)} />
  }

  return (
    <PercentageChange
      performance={timeseries}
      dataType={dataType}
      range={range}
      className={cn('whitespace-nowrap', className)}
    />
  )
}

const YieldOverlayInfo = () => {
  const apyData = useAtomValue(indexDTFApyAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const stats = useAtomValue(apyStatsAtom)

  return (
    <>
      <div className="flex items-center gap-2 text-xl sm:text-2xl font-light leading-none">
        {apyData ? (
          <Trans>{formatPercentage(apyData.totalAPY)} Est. APY</Trans>
        ) : (
          <Skeleton className="w-[200px] h-7 sm:h-8" />
        )}
      </div>
      {stats && (
        <span className="text-sm text-muted-foreground">
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

const PriceOverlayInfo = ({
  timeseries,
}: {
  timeseries: IndexDTFPerformance['timeseries']
}) => {
  const dtf = useAtomValue(indexDTFAtom)

  return (
    <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
      <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
        <div className="tabular-nums text-foreground">
          <PriceValue />
        </div>
        {dtf && (
          <>
            <div className="shrink-0">·</div>
            <div className="shrink-0">${dtf.token.symbol}</div>
          </>
        )}
        <div className="hidden shrink-0 items-center gap-2 font-medium tabular-nums lg:flex">
          <span className="font-normal text-legend">·</span>
          <PricePerformanceChange timeseries={timeseries} />
        </div>
      </div>
      <div className="shrink-0 text-base font-medium tabular-nums lg:hidden">
        <PricePerformanceChange timeseries={timeseries} />
      </div>
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

  return (
    <div
      className={cn(
        'flex flex-col gap-1 pt-1',
        isYieldMode ? '-mb-1.5 sm:-mb-2.5' : 'mb-4 sm:mb-6'
      )}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <OverlayTitle />
          </div>
          <IndexTokenAddress
            theme="light"
            className="hidden h-9 shrink-0 rounded-full border-card bg-card px-3 !text-sm font-medium lg:flex"
            labelClassName="!text-sm font-normal text-muted-foreground"
            labelGroupClassName="h-full gap-1.5"
            stackedLogoClassName="pt-0 h-4 w-4"
            logoClassName="h-4 w-4 rounded-md border border-card bg-card"
            chevronClassName="h-3.5 w-3.5 text-muted-foreground"
          />
        </div>
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
