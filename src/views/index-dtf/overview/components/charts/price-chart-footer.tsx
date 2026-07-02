import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue } from 'jotai'
import ChartTypeSelector from './chart-type-selector'
import DataTypeSelector from './data-type-selector'
import TimeRangeSelector from './time-range-selector'

const StandardFooter = () => (
  <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
    <div className="flex min-w-0 items-center gap-6 xl:hidden">
      <ChartTypeSelector />
      <div className="h-4 w-px shrink-0 bg-border" />
      <div className="min-w-0 flex-1">
        <TimeRangeSelector />
      </div>
    </div>
    <div className="hidden w-full items-center justify-between xl:flex">
      <TimeRangeSelector />
      <ChartTypeSelector />
    </div>
  </div>
)

const YieldFooter = () => (
  <div className="flex flex-col gap-2 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 xl:flex-row">
    <div className="flex items-center justify-between pb-2 xl:hidden">
      <TimeRangeSelector variant="minimal" />
      <DataTypeSelector variant="minimal" />
    </div>
    <div className="flex items-center gap-2 justify-between xl:flex-1">
      <div className="hidden xl:block">
        <TimeRangeSelector />
      </div>
      <div className="hidden xl:block">
        <DataTypeSelector />
      </div>
    </div>
  </div>
)

const PriceChartFooter = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  return isYieldIndexDTF ? <YieldFooter /> : <StandardFooter />
}

export default PriceChartFooter
