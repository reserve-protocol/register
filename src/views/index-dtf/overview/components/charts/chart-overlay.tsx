import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { btcPriceAtom } from '@/state/chain/atoms/chainAtoms'
import {
  indexDTFApyAtom,
  indexDTFAtom,
  indexDTFPriceAtom,
  isYieldIndexDTFAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { formatPercentage, formatToSignificantDigits } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import { ApyDataPoint } from '../../hooks/use-dtf-apy-history'
import IndexTokenLogo from '../index-token-logo'
import { DataType, dataTypeAtom } from './price-chart'
import TimeRangeSelector from './time-range-selector'
import IndexCreatorOverview from '../index-creator-overview'
import IndexTokenAddress from '../index-token-address'

const calculatePercentageChange = (
  performance: IndexDTFPerformance['timeseries'],
  dataType: DataType,
  wrap: boolean = false,
  range: string = '7d'
) => {
  if (performance.length < 2) {
    return <span className="text-legend">No data</span>
  }
  const firstValue = performance[0][dataType as keyof (typeof performance)[0]] as number
  const penultimateValue = performance[performance.length - 2][dataType as keyof (typeof performance)[0]] as number

  const percentageChange =
    firstValue === 0 ? penultimateValue : ((penultimateValue - firstValue) / firstValue) * 100

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

const YieldOverlayInfo = ({
  apyTimeseries,
}: {
  apyTimeseries: ApyDataPoint[]
}) => {
  const apyData = useAtomValue(indexDTFApyAtom)
  const range = useAtomValue(performanceTimeRangeAtom)

  const avg =
    apyTimeseries.length > 0
      ? apyTimeseries.reduce((sum, d) => sum + d.totalAPY, 0) /
        apyTimeseries.length
      : 0
  const min =
    apyTimeseries.length > 0
      ? Math.min(...apyTimeseries.map((d) => d.totalAPY))
      : 0
  const max =
    apyTimeseries.length > 0
      ? Math.max(...apyTimeseries.map((d) => d.totalAPY))
      : 0

  return (
    <>
      <div className="flex items-center gap-2 text-xl sm:text-2xl font-light">
        {apyData ? (
          <>
            {formatPercentage(apyData.totalAPY)} Est. APY
          </>
        ) : (
          <Skeleton className="w-[200px] h-7 sm:h-8" />
        )}
      </div>
      {apyTimeseries.length > 0 && (
        <span className="text-sm text-white/60">
          Avg {formatPercentage(avg)} · range {formatPercentage(min)}–
          {formatPercentage(max)} ({range === 'all' ? 'All' : range})
        </span>
      )}
    </>
  )
}

const ChartOverlay = ({
  timeseries,
  apyTimeseries = [],
}: {
  timeseries: IndexDTFPerformance['timeseries']
  apyTimeseries?: ApyDataPoint[]
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const price = useAtomValue(indexDTFPriceAtom)
  const btcPrice = useAtomValue(btcPriceAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'
  const priceInBTC = price && btcPrice ? price / btcPrice : null

  return (
    <div className={`flex flex-col gap-2 ${isYieldMode ? '-mb-1.5 sm:-mb-2.5' : 'mb-0 sm:mb-3'}`}>
      <div className="flex items-center gap-1 justify-between">
        <div className="flex items-center bg-white/20 rounded-full p-[1px] w-fit">
          <IndexTokenLogo />
        </div>
        {isYieldIndexDTF ? (
          <>
            <div className="hidden xl:flex items-center gap-2">
              <IndexTokenAddress />
              <IndexCreatorOverview />
            </div>
            <div className="flex xl:hidden items-center gap-2">
              <IndexCreatorOverview />
            </div>
          </>
        ) : (
          <>
            <div className="hidden xl:block">
              <IndexCreatorOverview />
            </div>
            <div className="block xl:hidden">
              <TimeRangeSelector />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {dtf ? (
          <h2 className="text-xl sm:text-2xl font-light w-full break-words">
            {dtf?.token.name}
          </h2>
        ) : (
          <Skeleton className="w-[250px] h-7 sm:h-8" />
        )}
        {isYieldMode ? (
          <YieldOverlayInfo apyTimeseries={apyTimeseries} />
        ) : (
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-light">
            {isBTCMode ? (
              priceInBTC === null ? (
                <Skeleton className="w-[100px] h-6 sm:h-7 mt-1" />
              ) : (
                <>₿{formatToSignificantDigits(priceInBTC)}</>
              )
            ) : !price ? (
              <Skeleton className="w-[100px] h-6 sm:h-7 mt-1" />
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
        )}
      </div>
    </div>
  )
}

export default ChartOverlay
