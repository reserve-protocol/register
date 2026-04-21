import { cn } from '@/lib/utils'
import { isYieldIndexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import IndexCTAsOverviewMobile from '../index-ctas-overview-mobile'
import IndexTokenAddress from '../index-token-address'
import DataTypeSelector from './data-type-selector'
import TimeRangeSelector from './time-range-selector'

const PriceChartFooter = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  return (
    <div
      className={cn(
        'flex flex-col xl:flex-row gap-2 mt-2',
        isYieldIndexDTF
          ? 'xl:border-t xl:border-white/20 xl:pt-4'
          : 'border-t border-white/20 pt-4'
      )}
    >
      {isYieldIndexDTF && (
        <div className="flex xl:hidden items-center justify-between mb-2 px-5 pt-2 pb-4 sm:px-6 border-b border-white/20">
          <TimeRangeSelector variant="minimal" />
          <DataTypeSelector variant="minimal" />
        </div>
      )}
      <div className="flex items-center gap-2 justify-between xl:flex-1">
        <div className="pl-6 hidden xl:block">
          <TimeRangeSelector />
        </div>
        <div className="hidden xl:block pr-6">
          {isYieldIndexDTF ? <DataTypeSelector /> : <IndexTokenAddress />}
        </div>
        <div className="flex xl:hidden flex-1 pl-3 sm:pl-6">
          <IndexTokenAddress />
        </div>
        <div className="min-w-sm pr-3 xl:pr-6 xl:hidden">
          <IndexCTAsOverviewMobile />
        </div>
      </div>
    </div>
  )
}

export default PriceChartFooter
