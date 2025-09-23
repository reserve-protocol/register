import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatToSignificantDigits } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import IndexTokenLogo from '../index-token-logo'
import { DataType, dataTypeAtom, timeRangeAtom } from './price-chart'
import TimeRangeSelector from './time-range-selector'

const calculatePercentageChange = (
  performance: IndexDTFPerformance['timeseries'],
  dataType: DataType,
  wrap: boolean = false,
  range: string = '7d'
) => {
  if (performance.length === 0) {
    return <span className="text-legend">No data</span>
  }
  const firstValue = performance[0][dataType]
  const lastValue = performance[performance.length - 1][dataType]

  const percentageChange =
    firstValue === 0 ? lastValue : ((lastValue - firstValue) / firstValue) * 100

  return (
    <div
      className={cn(
        'flex items-center',
        percentageChange < 0
          ? 'text-red-500'
          : percentageChange > 0
            ? 'text-success'
            : ''
      )}
    >
      {`${wrap ? '(' : ''}`}
      {percentageChange > 0 ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
      {`${percentageChange.toFixed(2)}%${wrap ? ')' : ''}`}
      <span className="ml-1">({range === 'all' ? 'All' : range})</span>
    </div>
  )
}

const ChartOverlay = ({ timeseries }: { timeseries: any }) => {
  const dataType = useAtomValue(dataTypeAtom)
  const range = useAtomValue(timeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const price = useAtomValue(indexDTFPriceAtom)

  return (
    <div className="mb-0 sm:mb-3 flex flex-col gap-2">
      <div className="flex items-center gap-1 justify-between">
        <div className="flex items-center bg-white rounded-full p-0.5 w-fit">
          <IndexTokenLogo />
        </div>
        <div>
          <TimeRangeSelector />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-xl sm:text-2xl font-light">
        {dtf ? (
          <h2 className="text-xl sm:text-2xl font-light w-full break-words">
            {dtf?.token.name}
          </h2>
        ) : (
          <Skeleton className="w-[250px] h-8" />
        )}
        <div className="flex items-center gap-2">
          {!price ? (
            <Skeleton className="w-[100px] h-7 mt-1" />
          ) : (
            <>
              {dataType !== 'totalSupply' ? '$' : ''}
              {formatToSignificantDigits(price)}
            </>
          )}
          <div className="text-sm">
            {!timeseries.length ? (
              <Skeleton className="w-[100px] h-6" />
            ) : (
              calculatePercentageChange(timeseries, dataType, false, range)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartOverlay
