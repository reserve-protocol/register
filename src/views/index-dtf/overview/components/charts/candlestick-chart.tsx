import { cn } from '@/lib/utils'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import CandlestickChartBody from './candlestick-chart-body'
import { ChartSkeleton } from './price-chart-body'
import { useCandlestickData } from './use-candlestick-data'

const CandlestickChart = ({
  bodyHeight,
  skeletonHeight,
}: {
  bodyHeight: string
  skeletonHeight: string
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const { candles, isLoading } = useCandlestickData()

  if (isLoading) {
    return <ChartSkeleton className={skeletonHeight} />
  }

  if (candles.length === 0) {
    return null
  }

  return (
    <CandlestickChartBody
      candles={candles}
      range={range}
      dtfStart={dtf?.timestamp}
      className={cn('w-full', bodyHeight)}
    />
  )
}

export default CandlestickChart
