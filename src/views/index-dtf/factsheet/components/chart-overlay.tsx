import TokenLogo from '@/components/token-logo'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatToSignificantDigits } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { factsheetChartTypeAtom, factsheetTimeRangeAtom } from '../atoms'
import type { ChartDataPoint } from '../mocks/factsheet-data'

interface ChartOverlayProps {
  timeseries: ChartDataPoint[]
  currentNav: number
}

const timeRangeChangeAtom = atom((get) => {
  const range = get(factsheetTimeRangeAtom)
  return range
})

const ChartOverlay = ({ timeseries, currentNav }: ChartOverlayProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
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
  const rangeLabel = range === 'all' ? 'all time' : range

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <TokenLogo
          src={brand?.dtf?.icon || undefined}
          alt={dtf?.token?.symbol ?? 'dtf token logo'}
          size="lg"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-xs text-white/60 dark:text-muted-foreground">
          {chartTitle} - ${dtf?.token?.symbol}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            ${formatToSignificantDigits(currentNav)}
          </span>
          {percentageChange !== undefined && (
            <span className="text-sm">
              <span className={percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
              </span>
              <span className="text-white/40 dark:text-muted-foreground ml-1">
                (+${Math.abs(currentNav * percentageChange / 100).toFixed(2)}) {rangeLabel}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartOverlay