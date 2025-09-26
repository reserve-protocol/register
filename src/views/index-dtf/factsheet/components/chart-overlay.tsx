import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatToSignificantDigits } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { timeRangeAtom } from '../../overview/components/charts/time-range-selector'
import IndexTokenLogo from '../../overview/components/index-token-logo'
import { factsheetChartTypeAtom } from '../atoms'
import type { ChartDataPoint } from '../mocks/factsheet-data'

interface ChartOverlayProps {
  timeseries: ChartDataPoint[]
  currentNav: number
}

const timeRangeChangeAtom = atom((get) => {
  const range = get(timeRangeAtom)
  return range
})

const ChartOverlay = ({ timeseries, currentNav }: ChartOverlayProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chartType = useAtomValue(factsheetChartTypeAtom)
  const range = useAtomValue(timeRangeChangeAtom)

  const percentageChange = useMemo(() => {
    if (!timeseries || timeseries.length < 2) return undefined

    const firstValue = timeseries[0]?.value
    const lastValue = timeseries[timeseries.length - 1]?.value

    if (!firstValue || !lastValue || firstValue === 0) return undefined
    return ((lastValue - firstValue) / firstValue) * 100
  }, [timeseries])

  const chartTitle = chartType === 'navGrowth' ? 'NAV Growth' : 'Monthly P&L'

  return (
    <div className="mb-0 sm:mb-3 flex flex-col gap-2">
      <div className="flex items-center bg-white/20 rounded-full p-[1px] w-fit">
        <IndexTokenLogo />
      </div>
      <div className="flex flex-col gap-0.5 text-xl sm:text-2xl font-light">
        {dtf ? (
          <h2 className="text-xl sm:text-2xl font-light w-full break-words">
            {chartTitle} - ${dtf?.token?.symbol}
          </h2>
        ) : (
          <Skeleton className="w-[250px] h-7 sm:h-8" />
        )}
        <div className="flex items-center gap-2">
          {!currentNav ? (
            <Skeleton className="w-[100px] h-6 sm:h-7 mt-1" />
          ) : (
            <>${formatToSignificantDigits(currentNav)}</>
          )}
          <div className="text-sm">
            {percentageChange === undefined ? (
              <Skeleton className="w-[100px] h-6" />
            ) : (
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
                {percentageChange > 0 ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {`${percentageChange.toFixed(2)}%`}
                <span className="ml-1">
                  ({range === 'all' ? 'All' : range})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartOverlay
