import { cn } from '@/lib/utils'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFMarketCapAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useIndexDTFApyHistory from '../../hooks/use-dtf-apy-history'
import CandlestickChart from './candlestick-chart'
import ChartOverlay from './chart-overlay'
import {
  apyHistoryAtom,
  apyTimeseriesAtom,
  chartTypeAtom,
  dataTypeAtom,
  priceHistoryAvailabilityAtom,
} from './price-chart-atoms'
import PriceChartBody, { ChartSkeleton } from './price-chart-body'
import PriceChartFooter from './price-chart-footer'
import { calculateTrailingSevenDayChange } from './price-chart-utils'
import { usePriceChartData } from './use-price-chart-data'

// Re-export so existing imports keep working.
export type { DataType } from './price-chart-constants'
export { dataTypeAtom } from './price-chart-atoms'

const getBodyHeight = (isYieldIndexDTF: boolean, isYieldMode: boolean) => {
  if (!isYieldIndexDTF) return 'h-72 sm:h-[332px]'
  const mobile = isYieldMode ? 'h-[256px]' : 'h-[272px]'
  return `${mobile} sm:h-[278px] xl:h-[318px]`
}

const getSkeletonHeight = (isYieldIndexDTF: boolean, isYieldMode: boolean) => {
  return getBodyHeight(isYieldIndexDTF, isYieldMode)
}

const ChartBodyArea = ({
  chartData,
  isLoading,
  xDomain,
}: {
  chartData: { timestamp: number }[]
  isLoading: boolean
  xDomain?: readonly [number, number]
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const chartType = useAtomValue(chartTypeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const isYieldMode = dataType === 'yield'

  const bodyHeight = getBodyHeight(isYieldIndexDTF, isYieldMode)
  const skeletonHeight = getSkeletonHeight(isYieldIndexDTF, isYieldMode)

  const lineBody = isLoading ? (
    <ChartSkeleton className={skeletonHeight} />
  ) : chartData.length === 0 ? null : (
    <PriceChartBody
      chartData={chartData as any}
      range={range}
      dtfStart={dtf?.timestamp}
      launchTimestamp={dtf?.timestamp}
      xDomain={xDomain}
      className={bodyHeight}
    />
  )

  // Candlestick is a standard-DTF, price-only view with its own data source;
  // when that source has no candles, fall back to the line chart rather than
  // leaving the (default) chart area blank.
  if (chartType === 'candlestick' && !isYieldIndexDTF) {
    return (
      <div className={bodyHeight}>
        <CandlestickChart
          bodyHeight={bodyHeight}
          skeletonHeight={skeletonHeight}
          fallback={lineBody}
        />
      </div>
    )
  }

  return <div className={bodyHeight}>{lineBody}</div>
}

const useSyncApyHistory = () => {
  const { data: apyHistory } = useIndexDTFApyHistory()
  const setApyHistory = useSetAtom(apyHistoryAtom)
  useEffect(() => {
    setApyHistory(apyHistory)
  }, [apyHistory, setApyHistory])
  return apyHistory
}

const useSync7dChange = (
  timeseries: { timestamp: number; price: number }[]
) => {
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  useEffect(() => {
    const sevenDayChange = calculateTrailingSevenDayChange(timeseries)
    if (sevenDayChange !== undefined) {
      set7dChange(sevenDayChange)
    }
  }, [timeseries, set7dChange])
}

const useSyncMarketCap = (timeseries: { marketCap: number }[]) => {
  const setMarketCap = useSetAtom(indexDTFMarketCapAtom)
  useEffect(() => {
    if (timeseries.length === 0) return
    setMarketCap(timeseries[timeseries.length - 1].marketCap)
  }, [timeseries, setMarketCap])
}

const useSyncPriceHistoryAvailability = (
  address: string | undefined,
  history: { timeseries: { timestamp: number; price: number }[] } | undefined
) => {
  const setPriceHistoryAvailability = useSetAtom(priceHistoryAvailabilityAtom)

  useEffect(() => {
    if (!address) {
      setPriceHistoryAvailability(undefined)
      return
    }

    if (history === undefined) return

    const firstTimestamp =
      history.timeseries.find(({ price }) => Boolean(price))?.timestamp ?? null

    setPriceHistoryAvailability({
      address: address.toLowerCase(),
      firstTimestamp,
    })
  }, [address, history, setPriceHistoryAvailability])
}

const PriceChart = () => {
  const dataType = useAtomValue(dataTypeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const apyTimeseries = useAtomValue(apyTimeseriesAtom)

  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'

  const {
    history,
    btcHistory,
    rangeAvailabilityHistory,
    timeseries,
    fullTimeseries,
    xDomain,
  } = usePriceChartData({ isBTCMode })
  const apyHistory = useSyncApyHistory()
  useSync7dChange(fullTimeseries)
  useSyncMarketCap(fullTimeseries)
  useSyncPriceHistoryAvailability(dtf?.id, rangeAvailabilityHistory)

  const chartData = isYieldMode ? apyTimeseries : timeseries

  const isLoading = isYieldMode
    ? !apyHistory
    : isBTCMode
      ? history === undefined || btcHistory === undefined
      : history === undefined

  return (
    <div
      data-testid="overview-price-chart"
      className={cn(
        'w-full overflow-hidden rounded-b-3xl border-t border-card bg-gradient-to-b from-secondary to-card text-foreground sm:rounded-3xl sm:border-t-0 sm:ring-1 sm:ring-inset sm:ring-white dark:bg-secondary dark:bg-none dark:sm:ring-card',
        isYieldIndexDTF ? 'overflow-hidden' : ''
      )}
    >
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <ChartOverlay timeseries={timeseries} />
      </div>
      <div className="sm:pr-6">
        <ChartBodyArea
          chartData={chartData}
          isLoading={isLoading}
          xDomain={isYieldMode ? undefined : xDomain}
        />
      </div>
      <PriceChartFooter />
    </div>
  )
}

export default PriceChart
