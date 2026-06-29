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
import PercentageChange from './percentage-change'
import { apyStatsAtom, dataTypeAtom } from './price-chart-atoms'

const OverlayTitle = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const isInactive = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  if (!dtf) {
    return <Skeleton className="w-[250px] h-7 sm:h-8" />
  }

  return (
    <h2 className="text-2xl sm:text-3xl font-light leading-tight w-full break-words">
      <div className="flex items-center gap-2">
        {dtf.token.name}
        {isInactive && <InactiveBadge />}
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
  const dataType = useAtomValue(dataTypeAtom)
  const range = useAtomValue(performanceTimeRangeAtom)

  return (
    <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
      <span className="truncate">
        <span className="tabular-nums text-foreground">
          <PriceValue />
        </span>
        {dtf && <span> · ${dtf.token.symbol}</span>}
      </span>
      <div className="shrink-0 text-base font-medium tabular-nums">
        {timeseries.length === 0 ? (
          <Skeleton className="h-6 w-[100px]" />
        ) : (
          <PercentageChange
            performance={timeseries}
            dataType={dataType}
            range={range}
            className="whitespace-nowrap"
          />
        )}
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
        <div className="flex items-start gap-2">
          <OverlayTitle />
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
