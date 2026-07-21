import { cn } from '@/lib/utils'
import { getChartReferenceTimestamp } from '@/utils/chart-reference-date'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'
import CandlestickChartBody from './candlestick-chart-body'
import { ChartSkeleton } from './price-chart-body'
import { useCandlestickData } from './use-candlestick-data'

const CandlestickChart = ({
  bodyHeight,
  skeletonHeight,
  fallback = null,
}: {
  bodyHeight: string
  skeletonHeight: string
  fallback?: ReactNode
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const { candles, isLoading, intervalSeconds } = useCandlestickData()

  if (isLoading) {
    return <ChartSkeleton className={skeletonHeight} />
  }

  if (candles.length === 0) {
    return fallback
  }

  return (
    <CandlestickChartBody
      candles={candles}
      range={range}
      dtfStart={dtf?.timestamp}
      launchTimestamp={getChartReferenceTimestamp(
        dtf?.id,
        dtf?.chainId,
        dtf?.timestamp
      )}
      intervalSeconds={intervalSeconds}
      className={cn('w-full', bodyHeight)}
    />
  )
}

export default CandlestickChart
