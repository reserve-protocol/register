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
import ChartOverlay from './chart-overlay'
import {
  apyHistoryAtom,
  apyTimeseriesAtom,
  dataTypeAtom,
} from './price-chart-atoms'
import PriceChartBody, { ChartSkeleton } from './price-chart-body'
import PriceChartFooter from './price-chart-footer'
import { usePriceChartData } from './use-price-chart-data'

// Re-export so existing imports keep working.
export type { DataType } from './price-chart-constants'
export { dataTypeAtom } from './price-chart-atoms'

const getBodyHeight = (isYieldIndexDTF: boolean, isYieldMode: boolean) => {
  if (!isYieldIndexDTF) return 'h-48 sm:h-[300px]'
  const mobile = isYieldMode ? 'h-[176px]' : 'h-[192px]'
  return `${mobile} sm:h-[254px] xl:h-[294px]`
}

const getSkeletonHeight = (isYieldIndexDTF: boolean, isYieldMode: boolean) => {
  if (!isYieldIndexDTF) return 'h-44 sm:h-[290px]'
  const mobile = isYieldMode ? 'h-[158px]' : 'h-[174px]'
  return `${mobile} sm:h-[244px] xl:h-[284px]`
}

const ChartBodyArea = ({
  chartData,
  isLoading,
}: {
  chartData: { timestamp: number }[]
  isLoading: boolean
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const isYieldMode = dataType === 'yield'

  const bodyHeight = getBodyHeight(isYieldIndexDTF, isYieldMode)
  const skeletonHeight = getSkeletonHeight(isYieldIndexDTF, isYieldMode)

  if (isLoading) {
    return (
      <div className={cn('pt-2 sm:pt-0', bodyHeight)}>
        <ChartSkeleton className={skeletonHeight} />
      </div>
    )
  }

  if (chartData.length === 0) {
    return <div className={cn('pt-2 sm:pt-0', bodyHeight)} />
  }

  return (
    <div className={cn('pt-2 sm:pt-0', bodyHeight)}>
      <PriceChartBody
        chartData={chartData as any}
        range={range}
        dtfStart={dtf?.timestamp}
        className={bodyHeight}
      />
    </div>
  )
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
  timeseries: { price: number }[],
  range: string
) => {
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  useEffect(() => {
    if (timeseries.length === 0 || range !== '7d') return
    const firstValue = timeseries[0].price
    const lastValue = timeseries[timeseries.length - 1].price
    set7dChange(
      firstValue === 0 ? undefined : (lastValue - firstValue) / firstValue
    )
  }, [timeseries, range, set7dChange])
}

const useSyncMarketCap = (timeseries: { marketCap: number }[]) => {
  const setMarketCap = useSetAtom(indexDTFMarketCapAtom)
  useEffect(() => {
    if (timeseries.length === 0) return
    setMarketCap(timeseries[timeseries.length - 1].marketCap)
  }, [timeseries, setMarketCap])
}

const PriceChart = () => {
  const range = useAtomValue(performanceTimeRangeAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const apyTimeseries = useAtomValue(apyTimeseriesAtom)

  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'

  const { history, btcHistory, timeseries } = usePriceChartData({ isBTCMode })
  const apyHistory = useSyncApyHistory()
  useSync7dChange(timeseries, range)
  useSyncMarketCap(timeseries)

  const chartData = isYieldMode ? apyTimeseries : timeseries

  const isLoading = isYieldMode
    ? !apyHistory
    : isBTCMode
      ? history === undefined || btcHistory === undefined
      : history === undefined

  return (
    <div
      className={cn(
        'lg:rounded-4xl lg:rounded-b-none bg-[#000] dark:bg-background lg:dark:bg-muted w-full text-[#fff] dark:text-foreground py-3 sm:py-6 pb-20 sm:h-[598px] xl:h-[599px] overflow-hidden',
        isYieldIndexDTF ? 'h-[478px]' : 'h-[438px]'
      )}
    >
      <div className="px-3 sm:px-6">
        <ChartOverlay timeseries={timeseries} />
        <ChartBodyArea chartData={chartData} isLoading={isLoading} />
      </div>
      <PriceChartFooter />
    </div>
  )
}

export default PriceChart
